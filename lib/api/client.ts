import { env } from "@/config/env";
import { ApiError, normalizeApiError, type ApiErrorBody } from "@/lib/api/errors";
import { tryRefreshToken } from "@/lib/auth/refresh";
import { clearTokens, getAccessToken } from "@/lib/auth/tokens";

const DEFAULT_TIMEOUT_MS = 15_000;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  /**
   * Request body. A `FormData` is sent as-is (multipart — `fetch` sets the
   * boundary; e.g. `PATCH /users/me` photo/profile). Anything else is
   * JSON-serialized with `Content-Type: application/json`.
   */
  body?: unknown;
  /** Attach the Bearer token and attempt a refresh on 401. Defaults to `true`. */
  auth?: boolean;
  headers?: Record<string, string>;
  /** Caller-owned abort signal, merged with the internal timeout. */
  signal?: AbortSignal;
  timeoutMs?: number;
};

/**
 * Invoked when an authenticated request 401s and the refresh fails. Lets the
 * (future) AuthSession drop to the login gate. RN has no `window.location`, so
 * the redirect is delegated to a registered handler instead.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function doFetch(
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const { method = "GET", body, headers, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", forwardAbort);
  }

  // FormData is sent verbatim: skip JSON.stringify AND omit Content-Type so
  // fetch can set the multipart boundary itself. Everything else is JSON.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    return await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener("abort", forwardAbort);
  }
}

function toTransportError(err: unknown, externalSignal?: AbortSignal): ApiError {
  if (err instanceof Error && err.name === "AbortError") {
    // A caller-driven abort propagates verbatim; otherwise it was our timeout.
    if (externalSignal?.aborted) throw err;
    return ApiError.timeout();
  }
  return ApiError.network();
}

/**
 * Typed request against the backend.
 *
 * On a 401 for an authenticated request: refresh once (deduped across callers)
 * and retry with the new token. If the refresh fails, clear tokens, notify the
 * unauthorized handler, and throw the normalized 401.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true } = options;

  let response: Response;
  try {
    response = await doFetch(path, options, auth ? await getAccessToken() : null);
  } catch (err) {
    throw toTransportError(err, options.signal);
  }

  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      try {
        response = await doFetch(path, options, await getAccessToken());
      } catch (err) {
        throw toTransportError(err, options.signal);
      }
    }
    // Still a 401 here means the session is unrecoverable — either the refresh
    // failed, or the freshly-refreshed token was itself rejected (revoked
    // server-side, or the keychain write silently failed). Drop to the gate.
    if (response.status === 401) {
      await clearTokens();
      onUnauthorized?.();
      throw normalizeApiError(401, (await parseBody(response)) as ApiErrorBody | null);
    }
  }

  const parsed = await parseBody(response);
  if (!response.ok) {
    throw normalizeApiError(response.status, parsed as ApiErrorBody | null);
  }
  return parsed as T;
}

/** Convenience verbs over `apiFetch`. */
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
