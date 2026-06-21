/** Major Islamic dates for the Hijri calendar's "My Islamic dates" list. */
import { gregorianForHijri, toHijriDate } from "./index";

export interface HijriEvent {
  id: string;
  /** Hijri month, 1–12. */
  month: number;
  day: number;
  nameEn: string;
  nameBn: string;
}

export const HIJRI_EVENTS: readonly HijriEvent[] = [
  { id: "islamic-new-year", month: 1, day: 1, nameEn: "Islamic New Year", nameBn: "হিজরি নববর্ষ" },
  { id: "ashura", month: 1, day: 10, nameEn: "Ashura", nameBn: "আশুরা" },
  { id: "mawlid", month: 3, day: 12, nameEn: "Eid Milad-un-Nabi", nameBn: "ঈদে মিলাদুন্নবী" },
  { id: "shab-e-barat", month: 8, day: 15, nameEn: "Shab-e-Barat", nameBn: "শবে বরাত" },
  { id: "ramadan-start", month: 9, day: 1, nameEn: "First of Ramadan", nameBn: "রমজান শুরু" },
  { id: "laylat-al-qadr", month: 9, day: 27, nameEn: "Laylat al-Qadr", nameBn: "লাইলাতুল কদর" },
  { id: "eid-al-fitr", month: 10, day: 1, nameEn: "Eid al-Fitr", nameBn: "ঈদুল ফিতর" },
  { id: "arafah", month: 12, day: 9, nameEn: "Day of Arafah", nameBn: "আরাফার দিন" },
  { id: "eid-al-adha", month: 12, day: 10, nameEn: "Eid al-Adha", nameBn: "ঈদুল আজহা" },
];

export interface UpcomingEvent extends HijriEvent {
  gregorian: Date;
  hijriYear: number;
}

/** The next `count` Islamic events from `today`, soonest first. */
export function upcomingEvents(today: Date, offsetDays = 0, count = 5): UpcomingEvent[] {
  const todayH = toHijriDate(today, offsetDays);
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const candidates: UpcomingEvent[] = [];
  for (const e of HIJRI_EVENTS) {
    for (const hy of [todayH.year, todayH.year + 1]) {
      const gregorian = gregorianForHijri(hy, e.month, e.day, offsetDays);
      if (gregorian.getTime() >= startOfToday.getTime()) {
        candidates.push({ ...e, gregorian, hijriYear: hy });
        break;
      }
    }
  }
  return candidates
    .sort((a, b) => a.gregorian.getTime() - b.gregorian.getTime())
    .slice(0, count);
}

export function eventName(e: HijriEvent, language: string): string {
  return language === "bn" ? e.nameBn : e.nameEn;
}
