/**
 * Weekly reflection (screen 110). There is no backend reflections endpoint, so:
 *  - the **stats** are derived client-side from the week's journal entries, and
 *  - the **free-text** reflection is persisted into the week-end (Friday) entry's
 *    `notes`, wrapped in a marker block so it coexists with that day's personal
 *    note. `stripReflectionBlock` keeps the daily-note editor clean; `merge`
 *    rewrites just the block.
 */
import { dateRange, dhakaToday } from "@/lib/journal/dates";
import { isCompleteDay, loggedPrayerCount, type JournalEntry, type QuranUnit } from "@/lib/journal/types";

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  /** Days in the week that have occurred (1–7), so future days aren't "missed". */
  daysElapsed: number;
  completeDays: number;
  prayersLogged: number;
  prayersPossible: number;
  /** 0–100, floored (never a premature 100). */
  prayerPercent: number;
  quranByUnit: Partial<Record<QuranUnit, number>>;
  byDay: { date: string; count: number; complete: boolean }[];
}

export function computeWeeklyStats(
  entries: JournalEntry[],
  week: { start: string; end: string },
  now: Date = new Date(),
): WeeklyStats {
  const today = dhakaToday(now);
  const byDate = new Map(entries.map((e) => [e.entry_date, e]));
  const days = dateRange(week.start, week.end);

  let completeDays = 0;
  let prayersLogged = 0;
  let daysElapsed = 0;
  const quranByUnit: Partial<Record<QuranUnit, number>> = {};
  const byDay: WeeklyStats["byDay"] = [];

  for (const date of days) {
    const entry = byDate.get(date);
    const count = entry ? loggedPrayerCount(entry.prayers) : 0;
    const complete = entry ? isCompleteDay(entry.prayers) : false;
    byDay.push({ date, count, complete });
    if (date <= today) {
      daysElapsed += 1;
      prayersLogged += count;
      if (complete) completeDays += 1;
    }
    if (entry?.quran) {
      quranByUnit[entry.quran.unit] = (quranByUnit[entry.quran.unit] ?? 0) + entry.quran.amount;
    }
  }

  const prayersPossible = daysElapsed * 5;
  const prayerPercent = prayersPossible > 0 ? Math.floor((prayersLogged / prayersPossible) * 100) : 0;

  return {
    weekStart: week.start,
    weekEnd: week.end,
    daysElapsed,
    completeDays,
    prayersLogged,
    prayersPossible,
    prayerPercent,
    quranByUnit,
    byDay,
  };
}

// ── Free-text reflection, embedded in a journal note ────────────────────────

export interface ReflectionText {
  insights: string;
  gratitude: string;
  nextWeek: string;
}

const OPEN = "⟦weekly-reflection⟧";
const CLOSE = "⟦/weekly-reflection⟧";
const BLOCK_RE = new RegExp(`\\n*${OPEN}[\\s\\S]*?${CLOSE}`, "g");

function isReflection(v: unknown): v is ReflectionText {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as ReflectionText).insights === "string" &&
    typeof (v as ReflectionText).gratitude === "string" &&
    typeof (v as ReflectionText).nextWeek === "string"
  );
}

/** Extract the reflection block from a note, or null if none. */
export function parseReflection(notes: string | null | undefined): ReflectionText | null {
  if (!notes) return null;
  const open = notes.indexOf(OPEN);
  const close = notes.indexOf(CLOSE);
  if (open === -1 || close === -1) return null;
  try {
    const json = notes.slice(open + OPEN.length, close).trim();
    const parsed = JSON.parse(json);
    return isReflection(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Return only the daily-note portion of a note (reflection block removed). */
export function stripReflectionBlock(notes: string | null | undefined): string {
  if (!notes) return "";
  return notes.replace(BLOCK_RE, "").trim();
}

/** Rewrite a note's reflection block, preserving any leading daily note. */
export function mergeReflection(
  notes: string | null | undefined,
  reflection: ReflectionText,
): string {
  const daily = stripReflectionBlock(notes);
  const block = `${OPEN}\n${JSON.stringify(reflection)}\n${CLOSE}`;
  return daily ? `${daily}\n\n${block}` : block;
}

/** True when a reflection has any content worth saving. */
export function hasReflectionContent(r: ReflectionText): boolean {
  return !!(r.insights.trim() || r.gratitude.trim() || r.nextWeek.trim());
}
