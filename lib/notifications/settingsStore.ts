/**
 * Local prayer-reminder preferences. Device-local (AsyncStorage), not synced to
 * the server (PRD 03) — and therefore they naturally survive guest→login. MVP
 * uses a single global offset (per-prayer offsets are post-MVP). Fails open to
 * the defaults.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { PRAYER_ORDER } from "@/lib/prayer/clock";
import type { PrayerName } from "@/lib/prayer/types";

const KEY = "masjidkoi.reminderPrefs.v1";

export type ReminderOffset = 5 | 10 | 15 | 30;
export const REMINDER_OFFSETS: readonly ReminderOffset[] = [5, 10, 15, 30];

export type AzanSoundId = "mecca" | "classic" | "default" | "silent";

export interface RamadanReminderPrefs {
  /** Suhoor reminder (before Fajr). */
  sehri: boolean;
  /** Suhoor-ends warning (just before Fajr). */
  sehriEnd: boolean;
  /** Iftar reminder (at Maghrib). */
  iftar: boolean;
}

export interface ReminderPrefs {
  /** Master switch (reminders only deliver if the OS permission is also granted). */
  enabled: boolean;
  /** Per-prayer on/off. */
  perPrayer: Record<PrayerName, boolean>;
  /** Global minutes-before-anchor offset. */
  offsetMinutes: ReminderOffset;
  /** A separate notification at the exact azan moment. */
  azanMoment: boolean;
  azanSound: AzanSoundId;
  /** Use a distinct sound/channel for Fajr. */
  fajrSeparate: boolean;
  fajrAzanSound: AzanSoundId;
  ramadan: RamadanReminderPrefs;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  enabled: true,
  perPrayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  offsetMinutes: 10,
  azanMoment: true,
  azanSound: "mecca",
  fajrSeparate: false,
  fajrAzanSound: "mecca",
  ramadan: { sehri: true, sehriEnd: true, iftar: true },
};

function coercePerPrayer(value: unknown): Record<PrayerName, boolean> {
  const out = { ...DEFAULT_REMINDER_PREFS.perPrayer };
  if (value && typeof value === "object") {
    for (const p of PRAYER_ORDER) {
      const v = (value as Record<string, unknown>)[p];
      if (typeof v === "boolean") out[p] = v;
    }
  }
  return out;
}

export async function getReminderPrefs(): Promise<ReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_REMINDER_PREFS };
    const p = JSON.parse(raw) as Partial<ReminderPrefs>;
    return {
      ...DEFAULT_REMINDER_PREFS,
      ...p,
      perPrayer: coercePerPrayer(p.perPrayer),
      ramadan: { ...DEFAULT_REMINDER_PREFS.ramadan, ...(p.ramadan ?? {}) },
    };
  } catch {
    return { ...DEFAULT_REMINDER_PREFS };
  }
}

/** A partial update — nested `perPrayer`/`ramadan` may be partial too. */
export type ReminderPrefsPatch = Partial<
  Omit<ReminderPrefs, "perPrayer" | "ramadan">
> & {
  perPrayer?: Partial<Record<PrayerName, boolean>>;
  ramadan?: Partial<RamadanReminderPrefs>;
};

/** Merge a patch over the current prefs and persist. Returns the merged value. */
export async function setReminderPrefs(patch: ReminderPrefsPatch): Promise<ReminderPrefs> {
  const current = await getReminderPrefs();
  const next: ReminderPrefs = {
    ...current,
    ...patch,
    perPrayer: { ...current.perPrayer, ...(patch.perPrayer ?? {}) },
    ramadan: { ...current.ramadan, ...(patch.ramadan ?? {}) },
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Non-fatal — in-memory cache still reflects the choice.
  }
  return next;
}
