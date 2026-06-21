/**
 * Date helpers for the community surfaces (feed event cards, event detail). The
 * backend sends events as a `YYYY-MM-DD` date + `HH:MM[:SS]` time; these parse
 * them as *local* values (avoiding a UTC day-shift) and produce the day/short-
 * month parts the `EventCard` badge needs. Numerals are applied by the caller via
 * `useFormat` so Bengali-numeral consistency is preserved.
 */

function intlLocale(language: string): string {
  return language === "bn" ? "bn-BD" : language === "ar" ? "ar" : "en-US";
}

/** Parse a `YYYY-MM-DD` date string as a local Date (no timezone shift). */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

/** Parse `YYYY-MM-DD` + `HH:MM[:SS]` into a single local Date. */
export function parseLocalDateTime(dateStr: string, timeStr: string): Date {
  const base = parseLocalDate(dateStr);
  const [hh, mm] = timeStr.split(":").map(Number);
  base.setHours(hh || 0, mm || 0, 0, 0);
  return base;
}

/** Localized short month label (e.g. "Jun" / "জুন"), with a numeric fallback. */
export function monthShortLabel(date: Date, language: string): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(language), { month: "short" }).format(date);
  } catch {
    return String(date.getMonth() + 1);
  }
}
