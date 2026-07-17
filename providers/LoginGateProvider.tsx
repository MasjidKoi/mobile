import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { LoginGateSheet, type GateReason } from "@/components/auth/LoginGateSheet";

import { useAuth } from "./AuthProvider";

type RequireAuth = (action: () => void, reason?: GateReason) => void;

type LoginGateContextValue = {
  /**
   * Gate a logged-in-only action. If authenticated, runs immediately; otherwise
   * presents the login sheet and resumes `action` once the flow completes.
   */
  requireAuth: RequireAuth;
  /** Called by the auth flow on full completion: close it + resume the action. */
  completeAuthFlow: () => void;
};

const LoginGateContext = createContext<LoginGateContextValue | null>(null);

export function useLoginGate(): LoginGateContextValue {
  const ctx = useContext(LoginGateContext);
  if (!ctx) {
    throw new Error("useLoginGate must be used within a LoginGateProvider");
  }
  return ctx;
}

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState<GateReason>("generic");
  // Held across the multi-screen modal flow; run once the flow completes.
  const pendingAction = useRef<(() => void) | null>(null);

  const requireAuth = useCallback<RequireAuth>(
    (action, nextReason = "generic") => {
      if (status === "authenticated") {
        action();
        return;
      }
      // During the brief launch "loading" window auth hasn't resolved yet — an
      // already-signed-in user would otherwise get a spurious login sheet. Treat
      // the tap as a no-op until status settles to guest/authenticated.
      if (status === "loading") return;
      pendingAction.current = action;
      setReason(nextReason);
      setVisible(true);
    },
    [status],
  );

  const cancel = useCallback(() => {
    pendingAction.current = null;
    setVisible(false);
  }, []);

  const continueToLogin = useCallback(() => {
    setVisible(false);
    router.push("/email");
  }, []);

  const completeAuthFlow = useCallback(() => {
    // The flow pushes a single screen (email) and then replaces it in place
    // (email → otp → profile-setup), so exactly one back() returns to the screen
    // that opened the gate. dismissAll() used to pop the whole stack down to the
    // first tab — discarding the masjid/donation screen the user gated from.
    router.back();
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  }, []);

  const value = useMemo<LoginGateContextValue>(
    () => ({ requireAuth, completeAuthFlow }),
    [requireAuth, completeAuthFlow],
  );

  return (
    <LoginGateContext.Provider value={value}>
      {children}
      <LoginGateSheet
        visible={visible}
        reason={reason}
        onContinue={continueToLogin}
        onClose={cancel}
      />
    </LoginGateContext.Provider>
  );
}
