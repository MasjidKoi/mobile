/**
 * App-wide reminder scheduler. Mounted inside the (app) layout (so it has auth +
 * location + query + i18n) and renders nothing. It rebuilds the local-
 * notification plan whenever the resolved times, prefs, home masjid, Ramadan
 * state or language change, and again whenever the app returns to the
 * foreground. Cheap: `useHomeTimes` is stable within a day, so this doesn't fire
 * on every clock tick.
 */
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

import { useHomeTimes } from "@/hooks/useHomeTimes";
import { useRamadan } from "@/hooks/useRamadan";
import { useReminderPrefs } from "@/hooks/useReminderPrefs";
import { applyReminderPlan, buildReminderPlan } from "@/lib/notifications/scheduler";
import { formatClockString } from "@/lib/prayer/format";

const SCHEDULE_DAYS = 3;

export function ReminderScheduler() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const home = useHomeTimes();
  const { prefs, isLoading } = useReminderPrefs();
  const { isRamadan } = useRamadan(home.times);

  const reschedule = useCallback(() => {
    if (isLoading || home.state !== "ready" || home.week.length === 0) return;
    const plan = buildReminderPlan({
      now: new Date(),
      days: SCHEDULE_DAYS,
      week: home.week,
      prefs,
      masjidId: home.masjidId,
      iqamahAware: home.variant === "masjid",
      ramadan: isRamadan,
    });
    void applyReminderPlan(plan, t, (hhmm) => formatClockString(hhmm, language));
  }, [isLoading, home.state, home.week, home.masjidId, home.variant, prefs, isRamadan, t, language]);

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
