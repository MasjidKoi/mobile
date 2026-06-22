import { useMemo } from "react";

import { nearestDistrict, type City } from "@/lib/location/cities";
import { computeCalculatedRange, computeCalculatedTimes, toLocalDateStr } from "@/lib/prayer/calculated";
import { resolveHomeTimes, type HomeTimes } from "@/lib/prayer/timesSource";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";

import { useAppConfig } from "./useAppConfig";
import { useHomeMasjid } from "./useHomeMasjid";
import { useJumah } from "./useJumah";
import { useNow } from "./useNow";
import { usePrayerTimes } from "./usePrayerTimes";

/** Localize a district label for the active language. */
export function districtLabel(district: City | null, language: string): string {
  if (!district) return "";
  return language === "bn" ? district.nameBn : district.nameEn;
}

/**
 * The home screen's single source of truth: composes the home masjid, location,
 * profile madhab and app-config with masjid-served prayer times, and resolves
 * the masjid / travel / calculated / offline variant the screen renders.
 *
 * The calculated fallback is memoized on the *day* (not the 30s clock tick), so
 * the result is stable within a day and the reminder scheduler doesn't churn.
 * The live countdown comes from `usePrayerClock(times)` in the screen, not here.
 */
export function useHomeTimes(): HomeTimes {
  const now = useNow();
  const todayStr = toLocalDateStr(now);
  const { homeMasjid } = useHomeMasjid();
  const { coords } = useLocation();
  const { user } = useAuth();
  const appConfig = useAppConfig();

  const madhab = user?.madhab ?? appConfig.data?.default_madhab ?? "hanafi";
  const method = appConfig.data?.default_calc_method ?? "KARACHI";

  const masjidId = homeMasjid?.masjidId ?? null;
  const prayerTimes = usePrayerTimes(masjidId, { days: 7 });
  const jumah = useJumah(masjidId);

  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;

  // Calculated times + district, recomputed only when the day or location changes.
  const calc = useMemo(() => {
    if (lat == null || lng == null) {
      return { calcToday: null, calcWeek: [], district: null as City | null };
    }
    const c = { lat, lng };
    const day = new Date(`${todayStr}T00:00:00`);
    return {
      calcToday: computeCalculatedTimes(c, day, { madhab, method }),
      calcWeek: computeCalculatedRange(c, 7, { madhab, method }, day),
      district: nearestDistrict(c),
    };
  }, [todayStr, lat, lng, madhab, method]);

  return useMemo(
    () =>
      resolveHomeTimes({
        todayStr,
        homeMasjid,
        coords,
        madhab,
        method,
        calcToday: calc.calcToday,
        calcWeek: calc.calcWeek,
        district: calc.district,
        masjidWeek: prayerTimes.data?.dates ?? [],
        masjidLoading: prayerTimes.isLoading,
        // Offline only once a fetch has actually settled in failure — not during
        // React Query's normal retry, which would flash a false offline banner.
        masjidOffline: prayerTimes.failureCount > 0 && !prayerTimes.isFetching,
        masjidUpdatedAt: prayerTimes.dataUpdatedAt || null,
        jumah: jumah.data ?? null,
      }),
    [
      todayStr,
      homeMasjid,
      coords,
      madhab,
      method,
      calc,
      prayerTimes.data,
      prayerTimes.isLoading,
      prayerTimes.isFetching,
      prayerTimes.failureCount,
      prayerTimes.dataUpdatedAt,
      jumah.data,
    ],
  );
}
