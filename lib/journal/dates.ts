/**
 * Asia/Dhaka day helpers. The backend's streak/journal logic uses a fixed
 * UTC+6 day boundary (no DST) and finalizes a date at 12:00 Dhaka on D+1. We
 * mirror that here purely for UI gating (disabling edits on finalized days,
 * computing the current Sat→Fri week for the reflection). The server stays the
 * source of truth — these helpers never replace its validation.
 */

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

interface DhakaParts {
  year: number;
  month: number; // 0-based
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = Sunday
}

function partsOf(now: Date): DhakaParts {
  const t = new Date(now.getTime() + DHAKA_OFFSET_MS);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth(),
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
    weekday: t.getUTCDay(),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a y/m(0-based)/d triple as an ISO date string (YYYY-MM-DD). */
export function isoDate(year: number, month0: number, day: number): string {
  return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}

/** Today's date (YYYY-MM-DD) in Asia/Dhaka. */
export function dhakaToday(now: Date = new Date()): string {
  const p = partsOf(now);
  return isoDate(p.year, p.month, p.day);
}

/** Parse a YYYY-MM-DD into a UTC-anchored Date at midnight (safe for arithmetic). */
export function parseIso(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Add `days` to an ISO date, returning a new ISO date. */
export function addDays(date: string, days: number): string {
  const d = parseIso(date);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Inclusive list of ISO dates from `from` to `to` (ascending). */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/**
 * A date is finalized once it's past 12:00 Dhaka on the following day. Before
 * that the day is "open" — still editable. Used to disable prayer toggles on
 * past days in the UI.
 */
export function isFinalized(entryDate: string, now: Date = new Date()): boolean {
  const p = partsOf(now);
  const today = isoDate(p.year, p.month, p.day);
  if (entryDate >= today) return false; // today or future is always open
  // entryDate < today. Finalized unless it's exactly yesterday and before noon.
  const yesterday = addDays(today, -1);
  if (entryDate === yesterday) return p.hour >= 12;
  return true;
}

/**
 * The current journaling week as a Sat→Fri range (Dhaka), matching the
 * recurring-goal/weekly-reflection convention (week culminates Friday, resets
 * Saturday). Returns `{ start, end }` as ISO dates.
 */
export function currentWeek(now: Date = new Date()): { start: string; end: string } {
  const p = partsOf(now);
  const today = isoDate(p.year, p.month, p.day);
  // weekday: 0=Sun..6=Sat. Days since the most recent Saturday.
  const sinceSaturday = (p.weekday + 1) % 7;
  const start = addDays(today, -sinceSaturday);
  return { start, end: addDays(start, 6) };
}
