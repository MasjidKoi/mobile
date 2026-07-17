import { env } from "@/config/env";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getRefreshToken, storeTokens } from "@/lib/auth/tokens";

/** Token payload returned by every `/auth/*` success. */
export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  is_new_user?: boolean;
};

/**
 * Single in-flight refresh. Concurrent 401s share one network call so we never
 * fire N parallel refreshes (ports the web app's `refreshPromise` singleton).
 *
 * Uses raw `fetch` — NOT the api client — to avoid interceptor recursion
 * (the client calls this on 401, so this calling the client would loop).
 */
let refreshPromise: Promise<boolean> | null = null;

export function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${env.apiBaseUrl}${ENDPOINTS.auth.refresh}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) return false;

      const data = (await response.json()) as TokenResponse;
      await storeTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      // MUST run on every exit path (incl. the no-token early return) or the
      // singleton stays a permanently-resolved `false` and disables refresh for
      // the rest of the JS session.
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
