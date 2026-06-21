import type { JournalEntry, Prayers, QuranLog } from "@/lib/journal/types";

import {
  computeWeeklyStats,
  mergeReflection,
  parseReflection,
  stripReflectionBlock,
  type ReflectionText,
} from "../compute";

function entry(date: string, prayers: Partial<Prayers>, quran?: QuranLog, notes?: string): JournalEntry {
  return {
    journal_id: `j-${date}`,
    entry_date: date,
    prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, ...prayers },
    quran: quran ?? null,
    is_protected: false,
    notes: notes ?? null,
    created_at: "",
    updated_at: "",
  };
}

const ALL: Prayers = { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };

describe("computeWeeklyStats", () => {
  const week = { start: "2026-06-20", end: "2026-06-26" }; // Sat → Fri
  const now = new Date("2026-06-23T06:00:00Z"); // 12:00 Dhaka on 2026-06-23

  const entries: JournalEntry[] = [
    entry("2026-06-20", ALL, { amount: 10, unit: "pages" }),
    entry("2026-06-21", { fajr: true, dhuhr: true, asr: true }),
    entry("2026-06-22", ALL, { amount: 5, unit: "pages" }),
    // 2026-06-23 has no entry (today, not yet logged)
  ];

  const stats = computeWeeklyStats(entries, week, now);

  it("counts only elapsed days, not the rest of the week", () => {
    expect(stats.daysElapsed).toBe(4); // 20,21,22,23
    expect(stats.byDay).toHaveLength(7);
  });
  it("sums logged prayers and complete days", () => {
    expect(stats.prayersLogged).toBe(13); // 5 + 3 + 5 + 0
    expect(stats.completeDays).toBe(2);
    expect(stats.prayersPossible).toBe(20);
  });
  it("floors the percentage", () => {
    expect(stats.prayerPercent).toBe(65); // floor(13/20*100)
  });
  it("aggregates Qur'an by unit", () => {
    expect(stats.quranByUnit.pages).toBe(15);
  });
});

describe("reflection note embedding", () => {
  const r: ReflectionText = { insights: "Calmer Fajrs", gratitude: "Health", nextWeek: "Read more" };

  it("round-trips through a note", () => {
    const note = mergeReflection(null, r);
    expect(parseReflection(note)).toEqual(r);
  });
  it("preserves a leading daily note and keeps it out of the reflection", () => {
    const merged = mergeReflection("Hard day today.", r);
    expect(stripReflectionBlock(merged)).toBe("Hard day today.");
    expect(parseReflection(merged)).toEqual(r);
  });
  it("replaces an existing block rather than appending a second", () => {
    const first = mergeReflection("note", r);
    const updated = mergeReflection(first, { ...r, gratitude: "Family" });
    expect(parseReflection(updated)?.gratitude).toBe("Family");
    expect(stripReflectionBlock(updated)).toBe("note");
    expect(updated.split("⟦weekly-reflection⟧")).toHaveLength(2); // exactly one block
  });
  it("returns null when there is no block", () => {
    expect(parseReflection("just a note")).toBeNull();
    expect(parseReflection(null)).toBeNull();
  });
});
