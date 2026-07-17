import { useTranslation } from "react-i18next";

import { getBengaliNumerals, useNumerals } from "./numerals";

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

/** Map ASCII digits in a string to Bengali numerals (০–৯) — e.g. "12:30" → "১২:৩০". */
export function toBengaliDigits(input: string): string {
  return input.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/** Map Bengali numerals (০–৯) back to ASCII digits — e.g. "১২:৩০" → "12:30". */
export function toLatinDigits(input: string): string {
  return input.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit as never)));
}

/**
 * Resolve digits for the Bengali UI per the opt-in toggle: ON → Bengali numerals,
 * OFF → Western (the PRD default, matching bKash/Nagad). No-op for en/ar.
 */
function applyNumerals(language: string, bengaliNumerals: boolean, value: string): string {
  if (language !== "bn") return value;
  return bengaliNumerals ? toBengaliDigits(value) : toLatinDigits(value);
}

function intlLocale(language: string): string {
  switch (language) {
    case "bn":
      return "bn-BD";
    case "ar":
      return "ar";
    default:
      return "en-US";
  }
}

/**
 * Hermes' `Intl` support can be partial on some devices. Every formatter runs
 * through this guard so a missing `Intl` data set degrades to a sensible
 * fallback (Bengali numerals for `bn`) instead of throwing.
 *
 * The success path is normalized too: Hermes' `Intl` may emit Latin digits for
 * `bn` (when bn-BD numbering data is absent) WITHOUT throwing, so we always run
 * `bn` output through `toBengaliDigits` to keep numerals consistent. It is
 * idempotent on already-Bengali digits.
 */
function safeFormat(
  language: string,
  bengaliNumerals: boolean,
  rawFallback: string,
  format: () => string,
): string {
  let out: string;
  try {
    out = format();
  } catch {
    out = rawFallback;
  }
  return applyNumerals(language, bengaliNumerals, out);
}

export function formatNumber(
  value: number,
  language: string,
  bengaliNumerals = getBengaliNumerals(),
): string {
  return safeFormat(language, bengaliNumerals, String(value), () =>
    new Intl.NumberFormat(intlLocale(language)).format(value),
  );
}

export function formatCurrency(
  amount: number,
  language: string,
  bengaliNumerals = getBengaliNumerals(),
  /**
   * Fixed fraction digits. Defaults to 0 (whole taka) for round donation
   * amounts; pass 2 for fractional values like the platform fee / net so the
   * Amount/Fee/Net breakdown reconciles instead of each rounding independently.
   */
  fractionDigits = 0,
): string {
  return safeFormat(language, bengaliNumerals, `৳${amount.toFixed(fractionDigits)}`, () =>
    new Intl.NumberFormat(intlLocale(language), {
      style: "currency",
      currency: "BDT",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount),
  );
}

export function formatTime(
  date: Date,
  language: string,
  bengaliNumerals = getBengaliNumerals(),
): string {
  const fallback = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
  return safeFormat(language, bengaliNumerals, fallback, () =>
    new Intl.DateTimeFormat(intlLocale(language), {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  );
}

export function formatDate(
  date: Date,
  language: string,
  bengaliNumerals = getBengaliNumerals(),
  /**
   * Force a timezone for the render. Pass `"UTC"` for date-only values anchored
   * at UTC midnight (e.g. journal `entry_date`) so a device west of UTC doesn't
   * format them as the previous calendar day. Omit for real instants.
   */
  timeZone?: string,
): string {
  return safeFormat(language, bengaliNumerals, date.toDateString(), () =>
    new Intl.DateTimeFormat(intlLocale(language), {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(timeZone ? { timeZone } : {}),
    }).format(date),
  );
}

/** Localized weekday name (e.g. "Monday" / "সোমবার") for the home date row. */
export function formatWeekday(date: Date, language: string): string {
  return safeFormat(language, false, date.toDateString().split(" ")[0]!, () =>
    new Intl.DateTimeFormat(intlLocale(language), { weekday: "long" }).format(date),
  );
}

/**
 * Distance for list/map/peek rows: metres under 1 km (rounded to 10 m),
 * kilometres with one decimal above. The unit label is localized; the number
 * routes through `formatNumber` so Bengali numerals stay consistent
 * (e.g. "৪১০ মিটার", "১.২ কিমি"). `unitM`/`unitKm` are the resolved unit words.
 */
export function formatDistance(
  meters: number,
  language: string,
  unitM: string,
  unitKm: string,
  bengaliNumerals = getBengaliNumerals(),
): string {
  if (meters < 1000) {
    const m = Math.round(meters / 10) * 10;
    return `${formatNumber(m, language, bengaliNumerals)} ${unitM}`;
  }
  const km = Math.round((meters / 1000) * 10) / 10;
  return `${formatNumber(km, language, bengaliNumerals)} ${unitKm}`;
}

/**
 * Locale-bound formatters for the active i18n language. Every screen renders
 * numbers/currency/time/distance through this so Bengali numerals stay
 * consistent.
 */
export function useFormat() {
  const { t, i18n } = useTranslation();
  const { enabled } = useNumerals();
  const language = i18n.language;
  return {
    number: (value: number) => formatNumber(value, language, enabled),
    currency: (amount: number) => formatCurrency(amount, language, enabled),
    /**
     * Currency with 2 decimals — for fractional values (fee / net) so the
     * donation breakdown reconciles with the shown gross.
     */
    currencyPrecise: (amount: number) => formatCurrency(amount, language, enabled, 2),
    time: (date: Date) => formatTime(date, language, enabled),
    date: (date: Date) => formatDate(date, language, enabled),
    /**
     * Format a UTC-anchored, date-only value (e.g. a journal `entry_date`
     * parsed to UTC midnight) in UTC so devices west of UTC don't shift it to
     * the previous calendar day.
     */
    dateUtc: (date: Date) => formatDate(date, language, enabled, "UTC"),
    weekday: (date: Date) => formatWeekday(date, language),
    /**
     * Relative "time ago" for feed/announcement timestamps (e.g. "3 hr ago",
     * "Yesterday", "2 days ago"). Falls back to an absolute date past ~a week.
     * The whole rendered string runs through the Bengali-numeral pass so digits
     * stay consistent with the rest of the UI.
     */
    fromNow: (date: Date) => {
      const ms = Date.now() - date.getTime();
      if (Number.isNaN(ms)) return formatDate(date, language, enabled);
      const min = Math.floor(ms / 60000);
      const hr = Math.floor(min / 60);
      const day = Math.floor(hr / 24);
      let out: string;
      if (min < 1) out = t("time.relative.justNow");
      else if (min < 60) out = t("time.relative.minutesAgo", { count: min });
      else if (hr < 24) out = t("time.relative.hoursAgo", { count: hr });
      else if (day < 2) out = t("time.relative.yesterday");
      else if (day < 7) out = t("time.relative.daysAgo", { count: day });
      else return formatDate(date, language, enabled);
      return language === "bn" && enabled ? toBengaliDigits(out) : out;
    },
    distance: (meters: number) =>
      formatDistance(meters, language, t("units.m"), t("units.km"), enabled),
    toBengaliDigits,
    /**
     * Localize the digits in an already-formatted string per the numerals
     * toggle (Bengali ০–৯ when on, Western otherwise; no-op for en/ar). Used for
     * pre-built strings like the hero countdown "4:08" / "৪:০৮".
     */
    localizeDigits: (value: string) => applyNumerals(language, enabled, value),
  };
}
