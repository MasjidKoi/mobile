import { useEffect, useState } from "react";

import { isOnboardingComplete } from "@/lib/onboarding";

export type OnboardingStatus = "loading" | "complete" | "pending";

/**
 * Reads the persisted first-run flag once on mount. `loading` covers the brief
 * async read; the route gate holds a neutral screen until it resolves so we
 * don't flash the wrong route.
 */
export function useOnboardingStatus(): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    let active = true;
    isOnboardingComplete().then((done) => {
      if (active) setStatus(done ? "complete" : "pending");
    });
    return () => {
      active = false;
    };
  }, []);

  return status;
}
