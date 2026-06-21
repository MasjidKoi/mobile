import { useTranslation } from "react-i18next";

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

/** Map ASCII digits in a string to Bengali numerals (০–৯) — e.g. "12:30" → "১২:৩০". */
export function toBengaliDigits(input: string): string {
  return input.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);
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
function safeFormat(language: string, rawFallback: string, format: () => string): string {
  try {
    const formatted = format();
    return language === "bn" ? toBengaliDigits(formatted) : formatted;
  } catch {
    return language === "bn" ? toBengaliDigits(rawFallback) : rawFallback;
  }
}

export function formatNumber(value: number, language: string): string {
  return safeFormat(language, String(value), () =>
    new Intl.NumberFormat(intlLocale(language)).format(value),
  );
}

export function formatCurrency(amount: number, language: string): string {
  return safeFormat(language, `৳${amount}`, () =>
    new Intl.NumberFormat(intlLocale(language), {
      style: "currency",
      currency: "BDT",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(amount),
  );
}

export function formatTime(date: Date, language: string): string {
  const fallback = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
  return safeFormat(language, fallback, () =>
    new Intl.DateTimeFormat(intlLocale(language), {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  );
}

export function formatDate(date: Date, language: string): string {
  return safeFormat(language, date.toDateString(), () =>
    new Intl.DateTimeFormat(intlLocale(language), {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date),
  );
}

/**
 * Locale-bound formatters for the active i18n language. Every screen renders
 * numbers/currency/time through this so Bengali numerals stay consistent.
 */
export function useFormat() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return {
    number: (value: number) => formatNumber(value, language),
    currency: (amount: number) => formatCurrency(amount, language),
    time: (date: Date) => formatTime(date, language),
    date: (date: Date) => formatDate(date, language),
    toBengaliDigits,
  };
}
