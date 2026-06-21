/**
 * Gamification nudges (Phase 9). Unlike prayer reminders (date-anchored, rolled
 * over a 3-day window), nudges are recurring daily/weekly reminders, so they use
 * the OS's repeating triggers — no rolling reschedule needed. The plan builder
 * is pure; `applyNudgePlan` cancels only `nudge-` identifiers then schedules.
 *
 * Note: a static daily trigger can't know whether today is already complete, so
 * the streak-at-risk nudge fires every evening with encouraging copy rather than
 * conditionally. That's an accepted limitation of local-only scheduling.
 *
 * The hours/weekdays below are interpreted by the OS in the DEVICE's local
 * timezone (expo DAILY/WEEKLY triggers are wall-clock, not zone-anchored).
 * For this app's audience that is effectively Dhaka; a device set to another
 * zone will see the nudge shift accordingly.
 */
import * as Notifications from "expo-notifications";

import { cancelScheduledByPrefix, NUDGE_NOTIF_PREFIX } from "./cancel";
import { GAMIFICATION_CHANNEL } from "./channels";
import type { GamificationPrefs } from "./gamificationPrefs";
import type { Translate } from "./scheduler";

/** Single source of truth for nudge kinds; `NudgeKind` is derived from it so the
 * tap-router allow-list in NotificationsBootstrap can't drift out of sync. */
export const NUDGE_KINDS = ["dailyLog", "streakAtRisk", "weeklyReflection"] as const;
export type NudgeKind = (typeof NUDGE_KINDS)[number];

export interface PlannedNudge {
  key: string;
  kind: NudgeKind;
  hour: number;
  minute: number;
  /** expo weekday (1=Sun … 7=Sat). Set → WEEKLY trigger; unset → DAILY. */
  weekday?: number;
}

/** The streak-at-risk last-chance reminder fires late evening (device-local). */
const STREAK_RISK_HOUR = 22;
/** The weekly-reflection nudge fires Friday evening (week culminates Friday). */
const REFLECTION_WEEKDAY = 6; // Friday
const REFLECTION_HOUR = 19;

/** Pure: which repeating nudges to schedule for the given prefs. */
export function buildNudgePlan(prefs: GamificationPrefs): PlannedNudge[] {
  if (!prefs.enabled) return [];
  const out: PlannedNudge[] = [];
  if (prefs.dailyLog) {
    out.push({ key: "nudge-daily-log", kind: "dailyLog", hour: prefs.dailyLogHour, minute: 0 });
  }
  if (prefs.streakAtRisk) {
    out.push({ key: "nudge-streak-risk", kind: "streakAtRisk", hour: STREAK_RISK_HOUR, minute: 0 });
  }
  if (prefs.weeklyReflection) {
    out.push({
      key: "nudge-weekly-reflection",
      kind: "weeklyReflection",
      weekday: REFLECTION_WEEKDAY,
      hour: REFLECTION_HOUR,
      minute: 0,
    });
  }
  return out;
}

function nudgeContent(n: PlannedNudge, t: Translate): { title: string; body: string } {
  return {
    title: t(`journal.nudges.${n.kind}.title`),
    body: t(`journal.nudges.${n.kind}.body`),
  };
}

/** Cancel only nudge identifiers, then schedule the repeating plan. */
export async function applyNudgePlan(plan: PlannedNudge[], t: Translate): Promise<void> {
  try {
    await cancelScheduledByPrefix([NUDGE_NOTIF_PREFIX]);
    for (const n of plan) {
      const content = nudgeContent(n, t);
      const trigger =
        n.weekday != null
          ? {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY as const,
              weekday: n.weekday,
              hour: n.hour,
              minute: n.minute,
              channelId: GAMIFICATION_CHANNEL,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.DAILY as const,
              hour: n.hour,
              minute: n.minute,
              channelId: GAMIFICATION_CHANNEL,
            };
      await Notifications.scheduleNotificationAsync({
        identifier: n.key,
        content: {
          title: content.title,
          body: content.body,
          data: { url: "masjidkoi://journal", kind: n.kind },
        },
        trigger,
      });
    }
  } catch {
    // Non-fatal — a scheduling failure shouldn't crash the app.
  }
}
