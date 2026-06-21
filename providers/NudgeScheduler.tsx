/**
 * App-wide gamification nudge scheduler. Mounted inside the (app) layout (so it
 * has auth + query + i18n) and renders nothing. It rebuilds the repeating
 * journal/streak/reflection nudges whenever the prefs or language change, and
 * again on foreground. Cheap — the OS owns the repetition, so this only fires on
 * a real change. Only schedules when the user is signed in.
 */
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

import { useGamificationPrefs } from "@/hooks/useGamificationPrefs";
import { applyNudgePlan, buildNudgePlan } from "@/lib/notifications/nudges";
import { cancelScheduledByPrefix, NUDGE_NOTIF_PREFIX } from "@/lib/notifications/cancel";
import { useAuth } from "@/providers/AuthProvider";

export function NudgeScheduler() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { prefs, isLoading } = useGamificationPrefs();
  // Signature of the last plan we applied. The OS owns the repetition, so a
  // foreground with unchanged prefs/language is a no-op — skip the cancel +
  // reschedule churn unless something actually changed.
  const lastSig = useRef<string | null>(null);

  const reschedule = useCallback(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      if (lastSig.current === "unauth") return;
      lastSig.current = "unauth";
      void cancelScheduledByPrefix([NUDGE_NOTIF_PREFIX]);
      return;
    }
    const plan = buildNudgePlan(prefs);
    const sig = `${i18n.language}|${JSON.stringify(plan)}`;
    if (lastSig.current === sig) return;
    lastSig.current = sig;
    void applyNudgePlan(plan, t);
  }, [isLoading, isAuthenticated, prefs, t, i18n.language]);

  useEffect(() => {
    reschedule();
  }, [reschedule]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") reschedule();
    });
    return () => sub.remove();
  }, [reschedule]);

  return null;
}
