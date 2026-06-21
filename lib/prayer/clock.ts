import type { PrayerName, PrayerTimeResponse } from "./types";

/** The five daily prayers, in chronological order. */
export const PRAYER_ORDER: readonly PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const AZAN_FIELD: Record<PrayerName, keyof PrayerTimeResponse> = {
  fajr: "fajr_azan",
  dhuhr: "dhuhr_azan",
  asr: "asr_azan",
  maghrib: "maghrib_azan",
  isha: "isha_azan",
};

const IQAMAH_FIELD: Record<PrayerName, keyof PrayerTimeResponse> = {
  fajr: "fajr_iqamah",
  dhuhr: "dhuhr_iqamah",
  asr: "asr_iqamah",
  maghrib: "maghrib_iqamah",
  isha: "isha_iqamah",
};

/** The azan `"HH:MM"` string for a prayer. */
export function azanTime(prayer: PrayerTimeResponse, name: PrayerName): string {
  return prayer[AZAN_FIELD[name]] as string;
}

/** The iqamah `"HH:MM"` string for a prayer, or null if the admin hasn't set it. */
export function iqamahTime(prayer: PrayerTimeResponse, name: PrayerName): string | null {
  return (prayer[IQAMAH_FIELD[name]] as string | null) ?? null;
}

/**
 * Build a `Date` for an `"HH:MM"` wall-clock string on the same calendar day as
 * `base`, in the device's local timezone. Bangladesh is a single timezone
 * (Asia/Dhaka), so device-local interpretation matches the masjid's wall clock
 * for the MVP — cross-timezone "travel mode" correctness is a Phase 4 concern.
 */
export function parseHHMM(hhmm: string, base: Date): Date {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export interface PrayerClockState {
  /** The prayer whose window is currently active (latest azan that has passed today). */
  currentPrayer: PrayerName | null;
  /** The next upcoming prayer. */
  nextPrayer: PrayerName | null;
  /** Absolute time of the next prayer's azan. */
  nextPrayerAt: Date | null;
  /** Milliseconds until `nextPrayerAt` (clamped to ≥ 0). */
  countdownMs: number | null;
}

/**
 * Derive current/next prayer + countdown from a day's azan times relative to
 * `now`. Before Fajr → next is today's Fajr and current is the previous night's
 * Isha (its window runs until Fajr). After Isha → next is tomorrow's Fajr
 * (today's Fajr azan + 1 day), current is Isha.
 */
export function computePrayerClock(prayer: PrayerTimeResponse, now: Date): PrayerClockState {
  const times = PRAYER_ORDER.map((name) => ({ name, at: parseHHMM(azanTime(prayer, name), now) }));

  let currentPrayer: PrayerName | null = null;
  let nextPrayer: PrayerName | null = null;
  let nextPrayerAt: Date | null = null;

  for (const entry of times) {
    if (now.getTime() >= entry.at.getTime()) {
      currentPrayer = entry.name;
    } else {
      nextPrayer = entry.name;
      nextPrayerAt = entry.at;
      break;
    }
  }

  // Before Fajr → the active window is still last night's Isha.
  if (currentPrayer === null) {
    currentPrayer = "isha";
  }

  // Past Isha → roll over to tomorrow's Fajr.
  if (!nextPrayer) {
    nextPrayer = "fajr";
    const fajrTomorrow = parseHHMM(azanTime(prayer, "fajr"), now);
    fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
    nextPrayerAt = fajrTomorrow;
  }

  const countdownMs = nextPrayerAt ? Math.max(0, nextPrayerAt.getTime() - now.getTime()) : null;
  return { currentPrayer, nextPrayer, nextPrayerAt, countdownMs };
}
