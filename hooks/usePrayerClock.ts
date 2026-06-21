import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { PrayerTableRow } from "@/components/PrayerTable";
import { toBengaliDigits } from "@/lib/i18n/format";
import { useNumerals } from "@/lib/i18n/numerals";
import { azanTime, computePrayerClock, iqamahTime, PRAYER_ORDER } from "@/lib/prayer/clock";
import { formatBareClock, splitCountdown } from "@/lib/prayer/format";
import type { PrayerName, PrayerTimeResponse } from "@/lib/prayer/types";

import { useNow } from "./useNow";

export interface UsePrayerClockResult {
  currentPrayer: PrayerName | null;
  nextPrayer: PrayerName | null;
  nextPrayerAt: Date | null;
  countdownMs: number | null;
  /** Localized name of the next prayer, e.g. "Asr" / "আসর". */
  nextPrayerLabel: string;
  /** Localized "Next prayer" kicker for the hero card. */
  nextPrayerKicker: string;
  /** Localized countdown, e.g. "1h 23m" / "১ ঘণ্টা ২৩ মিনিট". Empty when no data. */
  countdownLabel: string;
}

/**
 * Live current/next-prayer clock for a day's prayer times — feeds the Home hero
 * card (`NearestMasjidCard`). Re-ticks every 30s (countdown is shown at minute
 * granularity, so a sub-minute tick would waste battery). Returns empty labels
 * until `prayer` loads.
 */
export function usePrayerClock(prayer: PrayerTimeResponse | null | undefined): UsePrayerClockResult {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { enabled: bengaliNumerals } = useNumerals();
  const now = useNow();

  const state = useMemo(
    () => (prayer ? computePrayerClock(prayer, now) : null),
    [prayer, now],
  );

  const nextPrayer = state?.nextPrayer ?? null;

  let countdownLabel = "";
  if (state?.countdownMs != null) {
    const { hours, minutes } = splitCountdown(state.countdownMs);
    const raw =
      hours > 0
        ? t("prayerClock.countdownHM", { hours, minutes })
        : t("prayerClock.countdownM", { minutes });
    // Follow the app-wide Bengali-numerals toggle (default OFF → Western) so the
    // countdown matches the prayer times and Hijri date around it.
    countdownLabel = language === "bn" && bengaliNumerals ? toBengaliDigits(raw) : raw;
  }

  return {
    currentPrayer: state?.currentPrayer ?? null,
    nextPrayer,
    nextPrayerAt: state?.nextPrayerAt ?? null,
    countdownMs: state?.countdownMs ?? null,
    nextPrayerLabel: nextPrayer ? t(`prayers.${nextPrayer}`) : "",
    nextPrayerKicker: t("prayerClock.nextPrayer"),
    countdownLabel,
  };
}

/**
 * Map a day's prayer times to `PrayerTable` rows with localized names + locale-
 * formatted azan/iqamah strings ("—" when iqamah is unset), and the live
 * `current` highlight from the clock. Feeds the Home table + Profile times
 * section.
 */
export function usePrayerTableRows(
  prayer: PrayerTimeResponse | null | undefined,
): PrayerTableRow[] {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  // `enabled` is unused in the body (formatClockString reads the numerals cache),
  // but it MUST stay in the deps so the rows recompute when the toggle flips —
  // otherwise the table keeps stale digits while the rest of the screen updates.
  const { enabled } = useNumerals();
  const { currentPrayer } = usePrayerClock(prayer);

  return useMemo(() => {
    if (!prayer) return [];
    // Bare 12-hour clock (no meridiem), matching the design's Prayer Table —
    // the prayer name already disambiguates morning/evening. Digits follow the
    // Bengali-numerals toggle, like the hero card's times.
    const bare = (hhmm: string | null) => {
      if (!hhmm) return "—";
      const s = formatBareClock(hhmm);
      return language === "bn" && enabled ? toBengaliDigits(s) : s;
    };
    return PRAYER_ORDER.map((name) => ({
      name: t(`prayers.${name}`),
      azan: bare(azanTime(prayer, name)),
      iqamah: bare(iqamahTime(prayer, name)),
      current: currentPrayer === name,
    }));
  }, [prayer, language, t, currentPrayer, enabled]);
}
