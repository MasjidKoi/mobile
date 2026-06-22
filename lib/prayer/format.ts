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
