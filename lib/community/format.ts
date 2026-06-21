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

/** Parse a `YYYY-MM-DD` date string as a local Date (no timezone shift). Returns
 * an Invalid Date for a missing/empty value rather than throwing. */
export function parseLocalDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(NaN);
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

/** Parse `YYYY-MM-DD` + `HH:MM[:SS]` into a single local Date. */
export function parseLocalDateTime(dateStr: string | null | undefined, timeStr: string | null | undefined): Date {
  const base = parseLocalDate(dateStr);
  if (timeStr) {
    const [hh, mm] = timeStr.split(":").map(Number);
    base.setHours(hh || 0, mm || 0, 0, 0);
  }
  return base;
}

/** Avatar initials for a display name (1–2 chars, upper-cased), with a neutral
 * fallback when there's no name. Shared by the review/feed/profile cards. */
export function initials(name: string | null | undefined, max = 2): string {
  return (name?.trim().slice(0, max) || "🙂").toUpperCase();
}

/** Localized short month label (e.g. "Jun" / "জুন"), with a numeric fallback. */
export function monthShortLabel(date: Date, language: string): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(language), { month: "short" }).format(date);
  } catch {
    return String(date.getMonth() + 1);
  }
}
