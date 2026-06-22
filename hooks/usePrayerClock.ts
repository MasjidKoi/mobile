import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { PrayerTableRow } from "@/components/PrayerTable";
import { toBengaliDigits } from "@/lib/i18n/format";
import { azanTime, computePrayerClock, iqamahTime, PRAYER_ORDER } from "@/lib/prayer/clock";
import { formatClockString, splitCountdown } from "@/lib/prayer/format";
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
    countdownLabel = language === "bn" ? toBengaliDigits(raw) : raw;
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
  const { currentPrayer } = usePrayerClock(prayer);

  return useMemo(() => {
    if (!prayer) return [];
    return PRAYER_ORDER.map((name) => {
      const iqamah = iqamahTime(prayer, name);
      return {
        name: t(`prayers.${name}`),
        azan: formatClockString(azanTime(prayer, name), language),
        iqamah: iqamah ? formatClockString(iqamah, language) : "—",
        current: currentPrayer === name,
      };
    });
  }, [prayer, language, t, currentPrayer]);
}
