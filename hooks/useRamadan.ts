import { useMemo } from "react";

import { isLast10Nights, isRamadan } from "@/lib/hijri";
import { parseHHMM } from "@/lib/prayer/clock";
import type { PrayerTimeResponse } from "@/lib/prayer/types";

import { useAppConfig } from "./useAppConfig";
import { useNow } from "./useNow";

export interface UseRamadanResult {
  isRamadan: boolean;
  isLast10Nights: boolean;
  /** Suhoor ends at today's Fajr azan. */
  sehriEndsAt: Date | null;
  /** Iftar at today's Maghrib azan. */
  iftarAt: Date | null;
  /** Milliseconds until iftar (Maghrib), clamped ≥ 0; null without times. */
  iftarCountdownMs: number | null;
}

/**
 * Ramadan-mode state derived from the adjusted Hijri month + the day's times.
 * Suhoor/Iftar are just the existing Fajr/Maghrib azan moments — no new data.
 */
export function useRamadan(times: PrayerTimeResponse | null | undefined): UseRamadanResult {
  const now = useNow();
  const offset = useAppConfig().data?.hijri_offset_days ?? 0;

  return useMemo(() => {
    const sehriEndsAt = times ? parseHHMM(times.fajr_azan, now) : null;
    const iftarAt = times ? parseHHMM(times.maghrib_azan, now) : null;
    return {
      isRamadan: isRamadan(now, offset),
      isLast10Nights: isLast10Nights(now, offset),
      sehriEndsAt,
      iftarAt,
      iftarCountdownMs: iftarAt ? Math.max(0, iftarAt.getTime() - now.getTime()) : null,
    };
  }, [now, offset, times]);
}
