/**
 * Normalized API error. The backend returns either `{ detail: "message" }` or a
 * structured `{ detail: { code, attempts_remaining? }, retry_after_seconds? }`
 * envelope (e.g. OTP verify / request). Transport failures (no response,
 * timeout) surface as synthetic `status: 0` errors so callers can branch on
 * `isNetworkError` without inspecting the cause.
 */
type DetailObject = {
  code?: string;
  attempts_remaining?: number;
  [key: string]: unknown;
};

export type ApiErrorBody = {
  detail?: string | DetailObject;
  retry_after_seconds?: number;
  [key: string]: unknown;
};

type ApiErrorOptions = {
  status: number;
  code?: string | null;
  message?: string;
  attemptsRemaining?: number | null;
  retryAfterSeconds?: number | null;
  body?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  /** Machine code from `detail.code`, or a synthetic code for transport errors. */
  readonly code: string | null;
  readonly attemptsRemaining: number | null;
  readonly retryAfterSeconds: number | null;
  readonly body: unknown;

  constructor(options: ApiErrorOptions) {
    super(options.message ?? options.code ?? `Request failed (${options.status})`);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code ?? null;
    this.attemptsRemaining = options.attemptsRemaining ?? null;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.body = options.body;
  }

  /** No response reached us (offline, DNS, connection reset). */
  static network(message = "Network request failed"): ApiError {
    return new ApiError({ status: 0, code: "network_error", message });
  }

  /** The request exceeded its timeout. */
  static timeout(message = "Request timed out"): ApiError {
    return new ApiError({ status: 0, code: "timeout", message });
  }

  /** True for synthetic transport errors (no HTTP status). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/** Build an `ApiError` from an HTTP status + parsed response body. */
export function normalizeApiError(status: number, body: ApiErrorBody | null): ApiError {
  const detail = body?.detail;
  const retryAfterSeconds =
    typeof body?.retry_after_seconds === "number" ? body.retry_after_seconds : null;

  if (detail && typeof detail === "object") {
    return new ApiError({
      status,
      code: detail.code ?? null,
      message: detail.code,
      attemptsRemaining:
        typeof detail.attempts_remaining === "number" ? detail.attempts_remaining : null,
      retryAfterSeconds,
      body,
    });
  }

  return new ApiError({
    status,
    code: null,
    message: typeof detail === "string" ? detail : undefined,
    retryAfterSeconds,
    body,
  });
}
