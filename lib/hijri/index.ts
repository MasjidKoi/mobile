/**
 * Hijri date engine. Tabular Umm-al-Qura conversion (via `hijri-converter`) plus
 * the platform's `hijri_offset_days` (−2…+2, from `GET /app-config`) so the NGO's
 * moon-sighting correction is honoured. The offset is applied by shifting the
 * Gregorian date before conversion; the inverse subtracts it. Fully offline.
 * Never claims astronomical precision — the offset is the source of truth.
 */
import { toGregorian, toHijri } from "hijri-converter";

import { toBengaliDigits } from "@/lib/i18n/format";

export const HIJRI_MONTHS_EN = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'dah",
  "Dhu al-Hijjah",
] as const;

export const HIJRI_MONTHS_BN = [
  "মহরম",
  "সফর",
  "রবিউল আউয়াল",
  "রবিউস সানি",
  "জমাদিউল আউয়াল",
  "জমাদিউস সানি",
  "রজব",
  "শাবান",
  "রমজান",
  "শাওয়াল",
  "জিলকদ",
  "জিলহজ",
] as const;

export interface HijriDate {
  /** Hijri year (e.g. 1447). */
  year: number;
  /** Hijri month, 1–12. */
  month: number;
  /** Day of month, 1–30. */
  day: number;
}

export function hijriMonthName(month: number, language: string): string {
  const idx = Math.min(Math.max(month, 1), 12) - 1;
  return language === "bn" ? HIJRI_MONTHS_BN[idx] : HIJRI_MONTHS_EN[idx];
}

function shift(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Adjusted Hijri date for a Gregorian date (offset applied). */
export function toHijriDate(gregorian: Date, offsetDays = 0): HijriDate {
  const shifted = shift(gregorian, offsetDays);
  const h = toHijri(shifted.getFullYear(), shifted.getMonth() + 1, shifted.getDate());
  return { year: h.hy, month: h.hm, day: h.hd };
}

/** Gregorian date for an adjusted Hijri date (inverse of {@link toHijriDate}). */
export function gregorianForHijri(year: number, month: number, day: number, offsetDays = 0): Date {
  const g = toGregorian(year, month, day);
  return shift(new Date(g.gy, g.gm - 1, g.gd), -offsetDays);
}

/** Days in an adjusted Hijri month (29 or 30) — offset cancels out of the diff. */
export function hijriMonthLength(year: number, month: number): number {
  const start = gregorianForHijri(year, month, 1);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const next = gregorianForHijri(nextYear, nextMonth, 1);
  return Math.round((next.getTime() - start.getTime()) / 86_400_000);
}

export interface HijriMonthDay {
  hijriDay: number;
  gregorian: Date;
  /** JS weekday, 0 = Sunday … 6 = Saturday. */
  weekday: number;
  isToday: boolean;
}

export interface HijriMonthView {
  year: number;
  month: number;
  monthNameEn: string;
  monthNameBn: string;
  days: HijriMonthDay[];
}

/** Build a renderable Hijri month (each day mapped to its Gregorian date + today flag). */
export function buildHijriMonth(
  year: number,
  month: number,
  today: Date,
  offsetDays = 0,
): HijriMonthView {
  const todayH = toHijriDate(today, offsetDays);
  const length = hijriMonthLength(year, month);
  const days: HijriMonthDay[] = [];
  for (let d = 1; d <= length; d++) {
    const gregorian = gregorianForHijri(year, month, d, offsetDays);
    days.push({
      hijriDay: d,
      gregorian,
      weekday: gregorian.getDay(),
      isToday: todayH.year === year && todayH.month === month && todayH.day === d,
    });
  }
  return {
    year,
    month,
    monthNameEn: HIJRI_MONTHS_EN[month - 1],
    monthNameBn: HIJRI_MONTHS_BN[month - 1],
    days,
  };
}

/** Step a (year, month) pair by ±1 month, wrapping the year. */
export function stepHijriMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const zero = (year * 12 + (month - 1)) + delta;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

export function isRamadan(gregorian: Date, offsetDays = 0): boolean {
  return toHijriDate(gregorian, offsetDays).month === 9;
}

export function isLast10Nights(gregorian: Date, offsetDays = 0): boolean {
  const h = toHijriDate(gregorian, offsetDays);
  return h.month === 9 && h.day >= 21;
}

/** Localized "14 জিলহজ 1447" style label (Bengali digits for `bn`). */
export function formatHijri(h: HijriDate, language: string): string {
  const raw = `${h.day} ${hijriMonthName(h.month, language)} ${h.year}`;
  return language === "bn" ? toBengaliDigits(raw) : raw;
}
