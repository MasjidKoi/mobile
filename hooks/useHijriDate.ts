import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatHijri, hijriMonthName, toHijriDate, type HijriDate } from "@/lib/hijri";

import { useAppConfig } from "./useAppConfig";
import { useNow } from "./useNow";

export interface UseHijriDateResult extends HijriDate {
  /** Active platform offset (−2…+2 days) from `GET /app-config`. */
  offset: number;
  monthName: string;
  /** Localized "১৪ জিলহজ ১৪৪৭" label (Bengali digits for `bn`). */
  label: string;
}

/** Today's adjusted Hijri date — feeds the home header and the calendar's "today". */
export function useHijriDate(): UseHijriDateResult {
  const now = useNow();
  const { i18n } = useTranslation();
  const offset = useAppConfig().data?.hijri_offset_days ?? 0;

  return useMemo(() => {
    const h = toHijriDate(now, offset);
    return {
      ...h,
      offset,
      monthName: hijriMonthName(h.month, i18n.language),
      label: formatHijri(h, i18n.language),
    };
  }, [now, offset, i18n.language]);
}
