import { formatTime } from "@/lib/i18n/format";

import { parseHHMM } from "./clock";

/**
 * Format an `"HH:MM"` wall-clock string into the active locale (the locale's
 * hour convention, with Bengali numerals for `bn`). Reuses the shared
 * `formatTime` so numerals stay consistent app-wide. The calendar day is
 * irrelevant — only hours/minutes show.
 */
export function formatClockString(hhmm: string, language: string): string {
  return formatTime(parseHHMM(hhmm, new Date()), language);
}

/**
 * Split a countdown in ms into whole hours + minutes, floored so a "time
 * remaining" reading never overstates (e.g. 59m40s shows 59m, not 1h 0m).
 */
export function splitCountdown(ms: number): { hours: number; minutes: number } {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

/**
 * Compact digital-clock countdown for the Home hero card — "H:MM" (e.g. "4:08")
 * or "H:MM:SS" for the Ramadan iftar countdown (e.g. "2:15:40"). Stays short so
 * it never crowds out the status pill the way the verbose "X ঘণ্টা Y মিনিট"
 * label did. Returns Western digits; the caller localizes via the numerals
 * toggle (`useFormat().localizeDigits`).
 */
export function formatCountdownClock(ms: number, withSeconds = false): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  if (withSeconds) return `${h}:${mm}:${String(total % 60).padStart(2, "0")}`;
  return `${h}:${mm}`;
}

/**
 * Format an `"HH:MM"` 24-hour string as a bare 12-hour clock ("18:28" → "6:28")
 * with no meridiem — the compact form the hero subtitle uses ("মাগরিব আজান
 * 6:28 · জামাত 6:35"). Returns Western digits; the caller localizes.
 */
export function formatBareClock(hhmm: string): string {
  const [h = "0", m = "0"] = hhmm.split(":");
  const hour = parseInt(h, 10);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(parseInt(m, 10)).padStart(2, "0")}`;
}
