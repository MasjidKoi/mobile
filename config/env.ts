import Constants from "expo-constants";

/**
 * Typed runtime configuration. Resolution order:
 *   1. `EXPO_PUBLIC_*` env vars (inlined at build time, override per-machine)
 *   2. `app.json` → `expo.extra`
 *   3. hardcoded defaults
 *
 * The backend mounts routers at ROOT — there is **no `/api/v1` prefix**.
 * `localhost` only works in the simulator/emulator; physical devices need a LAN
 * IP or tunnel via `EXPO_PUBLIC_API_BASE_URL`.
 */
type Extra = { apiBaseUrl?: string; appEnv?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const DEFAULT_API_BASE_URL = "http://localhost:8001";

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

export const env = {
  /** Backend base URL (no version prefix). */
  apiBaseUrl: stripTrailingSlash(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? DEFAULT_API_BASE_URL,
  ),
  /** "development" | "staging" | "production". */
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? extra.appEnv ?? "development",
  /** Deep-link scheme — must match the `masjidkoi://` URIs the backend emits. */
  deepLinkScheme: "masjidkoi",
} as const;

export type Env = typeof env;
