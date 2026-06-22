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
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState<GateReason>("generic");
  // Held across the multi-screen modal flow; run once the flow completes.
  const pendingAction = useRef<(() => void) | null>(null);

  const requireAuth = useCallback<RequireAuth>(
    (action, nextReason = "generic") => {
      if (isAuthenticated) {
        action();
        return;
      }
      pendingAction.current = action;
      setReason(nextReason);
      setVisible(true);
    },
    [isAuthenticated],
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
    // Dismiss the whole auth modal back to the underlying tab, then resume.
    router.dismissAll();
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
