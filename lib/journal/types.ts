/**
 * Journal (`/users/me/journal`). The daily prayer/Qur'an log that the streak,
 * badges, goals (Qur'an-quantity), and weekly reflection all derive from.
 *
 * Upserts are field-level: only the fields present in the body are written.
 * Omitting `prayers` leaves the five booleans untouched; sending `quran: null`
 * clears Qur'an progress. Once a date finalizes (noon Dhaka on D+1) its
 * `prayers`/`is_protected` are immutable — `notes`/`quran` stay editable.
 */

export const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type Prayers = Record<PrayerKey, boolean>;

export const QURAN_UNITS = ["pages", "juz", "minutes"] as const;
export type QuranUnit = (typeof QURAN_UNITS)[number];

export interface QuranLog {
  amount: number;
  unit: QuranUnit;
}

export interface JournalEntry {
  journal_id: string;
  entry_date: string; // ISO date (YYYY-MM-DD)
  prayers: Prayers;
  quran: QuranLog | null;
  is_protected: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Field-level upsert body. Only present fields are written. */
export interface JournalUpsert {
  entry_date: string;
  prayers?: Partial<Prayers>;
  quran?: QuranLog | null;
  notes?: string;
  is_protected?: boolean;
}

export interface JournalListResponse {
  items: JournalEntry[];
  total: number;
  page: number;
  page_size: number;
}

/** Count of logged prayers in an entry (0–5). */
export function loggedPrayerCount(prayers: Prayers): number {
  return PRAYER_KEYS.reduce((n, k) => n + (prayers[k] ? 1 : 0), 0);
}

/** A "complete" day = all five prayers logged (the streak rule). */
export function isCompleteDay(prayers: Prayers): boolean {
  return loggedPrayerCount(prayers) === 5;
}
