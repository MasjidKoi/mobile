/**
 * ReminderScheduler — turns (cached times + prefs + home masjid) into a rolling
 * ~3-day plan of local notifications, then applies it. The plan builder is pure
 * and unit-testable. Rules (PRD 03):
 *  - default anchor is "N min before azan"; when the masjid has an iqamah for a
 *    prayer the reminder **upgrades to iqamah-anchored** ("Jama'ah at 1:30");
 *  - per-prayer toggles + a separate azan-moment notification;
 *  - Ramadan adds suhoor / suhoor-ends / iftar reminders;
 *  - the total is capped under iOS's 64-pending limit;
 *  - each notification carries a `masjidkoi://` deep link to the masjid + prayer.
 */
import * as Notifications from "expo-notifications";

import { azanTime, iqamahTime, PRAYER_ORDER, parseHHMM } from "@/lib/prayer/clock";
import type { PrayerName, PrayerTimeResponse } from "@/lib/prayer/types";

import { cancelScheduledByPrefix, PRAYER_NOTIF_PREFIXES } from "./cancel";
import { channelForAzan, channelForReminder, RAMADAN_CHANNEL } from "./channels";
import type { ReminderPrefs } from "./settingsStore";

const MAX_PENDING = 60;
const SEHRI_REMINDER_OFFSET_MIN = 30;
const SEHRI_END_WARN_MIN = 10;
const MINUTE_MS = 60_000;

export type ReminderKind = "reminder" | "azan" | "sehri" | "sehriEnd" | "iftar";
export type ReminderLabel = PrayerName | "sehri" | "iftar";

export interface PlannedNotification {
  key: string;
  label: ReminderLabel;
  kind: ReminderKind;
  fireAt: Date;
  anchor: "azan" | "iqamah";
  /** Anchor wall-clock "HH:MM" (for the body copy). */
  atHHMM: string;
  minutesBefore: number;
  masjidId: string | null;
  channelId: string;
}

export interface BuildReminderPlanInput {
  now: Date;
  /** How many days ahead to schedule (≈3). */
  days: number;
  /** Resolved per-day times (masjid-served or calculated). */
  week: PrayerTimeResponse[];
  prefs: ReminderPrefs;
  masjidId: string | null;
  /** Masjid variant → upgrade reminders to iqamah anchor when iqamah is set. */
  iqamahAware: boolean;
  ramadan: boolean;
  maxPending?: number;
}

function dayBase(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Pure: build the schedule plan. */
export function buildReminderPlan(input: BuildReminderPlanInput): PlannedNotification[] {
  const { now, days, week, prefs, masjidId, iqamahAware, ramadan } = input;
  const out: PlannedNotification[] = [];
  if (!prefs.enabled) return out;

  const nowMs = now.getTime();
  for (const day of week.slice(0, Math.max(0, days))) {
    const base = dayBase(day.date);

    for (const prayer of PRAYER_ORDER) {
      if (!prefs.perPrayer[prayer]) continue;
      const azanStr = azanTime(day, prayer);
      const azanAt = parseHHMM(azanStr, base);
      const iqamahStr = iqamahAware ? iqamahTime(day, prayer) : null;
      const anchorStr = iqamahStr ?? azanStr;
      const anchorAt = parseHHMM(anchorStr, base);

      const remindAt = new Date(anchorAt.getTime() - prefs.offsetMinutes * MINUTE_MS);
      if (remindAt.getTime() > nowMs) {
        out.push({
          key: `reminder-${day.date}-${prayer}`,
          label: prayer,
          kind: "reminder",
          fireAt: remindAt,
          anchor: iqamahStr ? "iqamah" : "azan",
          atHHMM: anchorStr,
          minutesBefore: prefs.offsetMinutes,
          masjidId,
          channelId: channelForReminder(prayer),
        });
      }

      // During Ramadan the iftar reminder already fires at Maghrib azan, so skip
      // the duplicate azan-moment for Maghrib.
      const iftarCoversMaghrib = ramadan && prayer === "maghrib" && prefs.ramadan.iftar;
      if (prefs.azanMoment && azanAt.getTime() > nowMs && !iftarCoversMaghrib) {
        out.push({
          key: `azan-${day.date}-${prayer}`,
          label: prayer,
          kind: "azan",
          fireAt: azanAt,
          anchor: "azan",
          atHHMM: azanStr,
          minutesBefore: 0,
          masjidId,
          channelId: channelForAzan(prayer, prefs),
        });
      }
    }

    if (ramadan) {
      const fajrStr = azanTime(day, "fajr");
      const maghribStr = azanTime(day, "maghrib");
      const fajrAt = parseHHMM(fajrStr, base);
      const maghribAt = parseHHMM(maghribStr, base);

      const pushRamadan = (
        key: string,
        kind: ReminderKind,
        fireAt: Date,
        atHHMM: string,
        minutesBefore: number,
        label: ReminderLabel,
      ) => {
        if (fireAt.getTime() > nowMs) {
          out.push({ key, label, kind, fireAt, anchor: "azan", atHHMM, minutesBefore, masjidId, channelId: RAMADAN_CHANNEL });
        }
      };

      if (prefs.ramadan.sehri) {
        pushRamadan(`sehri-${day.date}`, "sehri", new Date(fajrAt.getTime() - SEHRI_REMINDER_OFFSET_MIN * MINUTE_MS), fajrStr, SEHRI_REMINDER_OFFSET_MIN, "sehri");
      }
      if (prefs.ramadan.sehriEnd) {
        pushRamadan(`sehri-end-${day.date}`, "sehriEnd", new Date(fajrAt.getTime() - SEHRI_END_WARN_MIN * MINUTE_MS), fajrStr, SEHRI_END_WARN_MIN, "sehri");
      }
      if (prefs.ramadan.iftar) {
        pushRamadan(`iftar-${day.date}`, "iftar", maghribAt, maghribStr, 0, "iftar");
      }
    }
  }

  out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return out.slice(0, input.maxPending ?? MAX_PENDING);
}

export type Translate = (key: string, opts?: Record<string, unknown>) => string;

export interface NotificationContent {
  title: string;
  body: string;
}

/** Localize a planned notification's copy (called at schedule time). */
export function buildContent(
  n: PlannedNotification,
  t: Translate,
  formatTime: (hhmm: string) => string,
): NotificationContent {
  const time = formatTime(n.atHHMM);
  switch (n.kind) {
    case "azan":
      return { title: t(`prayers.${n.label}`), body: t("reminders.notif.azanBody", { time }) };
    case "sehri":
      return { title: t("ramadan.notif.sehriTitle"), body: t("ramadan.notif.sehriBody", { minutes: n.minutesBefore, time }) };
    case "sehriEnd":
      return { title: t("ramadan.notif.sehriEndTitle"), body: t("ramadan.notif.sehriEndBody", { time }) };
    case "iftar":
      return { title: t("ramadan.notif.iftarTitle"), body: t("ramadan.notif.iftarBody", { time }) };
    case "reminder":
    default:
      return n.anchor === "iqamah"
        ? { title: t(`prayers.${n.label}`), body: t("reminders.notif.iqamahBody", { time }) }
        : { title: t(`prayers.${n.label}`), body: t("reminders.notif.reminderBody", { minutes: n.minutesBefore, time }) };
  }
}

function deepLink(n: PlannedNotification): string {
  return n.masjidId ? `masjidkoi://masjid/${n.masjidId}?prayer=${n.label}` : "masjidkoi://";
}

/** Cancel all pending reminders and schedule the new plan. */
export async function applyReminderPlan(
  plan: PlannedNotification[],
  t: Translate,
  formatTime: (hhmm: string) => string,
): Promise<void> {
  try {
    // Cancel only prayer-owned identifiers so gamification nudges (scheduled
    // separately under the `nudge-` prefix) survive a reminder reschedule.
    await cancelScheduledByPrefix(PRAYER_NOTIF_PREFIXES);
    for (const n of plan) {
      const content = buildContent(n, t, formatTime);
      await Notifications.scheduleNotificationAsync({
        identifier: n.key,
        content: {
          title: content.title,
          body: content.body,
          data: { url: deepLink(n), masjidId: n.masjidId, prayer: n.label, kind: n.kind },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: n.fireAt,
          channelId: n.channelId,
        },
      });
    }
  } catch {
    // Non-fatal — a scheduling failure shouldn't crash the app.
  }
}
