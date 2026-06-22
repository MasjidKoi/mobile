import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Snackbar } from "@/components";
import { api, setUnauthorizedHandler } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import type { TokenResponse } from "@/lib/auth/refresh";
import { clearTokens, getAccessToken, storeTokens } from "@/lib/auth/tokens";
import type { Madhab } from "@/lib/forms/schemas";
import { resetGuestMigration, runGuestMigration } from "@/lib/guest/migration";
import { registerDevice, unregisterDevice } from "@/lib/notifications/device";
import { qk } from "@/lib/query/keys";

/** `GET /users/me` response. All profile fields are null until the user sets them. */
export type UserProfile = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  madhab: Madhab | null;
  profile_photo_url: string | null;
  is_deleted: boolean;
  donate_anonymously_by_default: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthStatus = "loading" | "guest" | "authenticated";

type AuthContextValue = {
  /** `loading` only covers the brief secure-store read at launch. */
  status: AuthStatus;
  /** Full profile from `qk.user.me()`, or null while loading / for guests. */
  user: UserProfile | null;
  isAuthenticated: boolean;
  /** Persist tokens, migrate guest data, flip to authenticated. */
  login: (tokens: TokenResponse) => Promise<void>;
  /** Revoke server-side (best effort), clear tokens, drop to guest. */
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const RELOGIN_TIMEOUT_MS = 7_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [reloginPrompt, setReloginPrompt] = useState(false);

  // Hydrate from the keychain: a stored token means optimistic `authenticated`
  // (the me-query reconciles, refreshing or degrading as needed). No token →
  // guest. We never block first paint on the network here.
  useEffect(() => {
    let active = true;
    getAccessToken().then((token) => {
      if (active) setStatus(token ? "authenticated" : "guest");
    });
    return () => {
      active = false;
    };
  }, []);

  const meQuery = useQuery({
    queryKey: qk.user.me(),
    queryFn: () => api.get<UserProfile>(ENDPOINTS.users.me),
    enabled: status === "authenticated",
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (tokens: TokenResponse) => {
      await storeTokens(tokens.access_token, tokens.refresh_token);
      try {
        await runGuestMigration();
      } catch {
        // Migration is best-effort — never block sign-in on it.
      }
      setStatus("authenticated");
      // Register the push token (best-effort; no-op until push is provisioned).
      void registerDevice();
      await queryClient.invalidateQueries({ queryKey: qk.user.me() });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    // Prune the device token while the session is still valid.
    await unregisterDevice();
    try {
      await api.post(ENDPOINTS.auth.logout);
    } catch {
      // Best effort — local sign-out proceeds regardless.
    }
    await clearTokens();
    await resetGuestMigration();
    setStatus("guest");
    queryClient.removeQueries({ queryKey: qk.user.me() });
  }, [queryClient]);

  // A soft-deleted account (410) can't be used — drop to guest.
  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 410) {
      void logout();
    }
  }, [meQuery.error, logout]);

  // Unrecoverable refresh failure (revoked/expired session). The client already
  // cleared tokens before calling this; we just reflect guest state + nudge.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setStatus("guest");
      queryClient.removeQueries({ queryKey: qk.user.me() });
      setReloginPrompt(true);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  // Auto-dismiss the gentle re-login nudge.
  useEffect(() => {
    if (!reloginPrompt) return;
    const id = setTimeout(() => setReloginPrompt(false), RELOGIN_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [reloginPrompt]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: meQuery.data ?? null,
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [status, meQuery.data, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {reloginPrompt ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 px-md"
          style={{ bottom: insets.bottom + 16 }}
        >
          <Snackbar
            message={t("auth.session.reloginPrompt")}
            actionLabel={t("auth.session.signIn")}
            onAction={() => {
              setReloginPrompt(false);
              router.push("/email");
            }}
          />
        </View>
      ) : null}
    </AuthContext.Provider>
  );
}
