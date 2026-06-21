/**
 * TimesSource — resolves *which* prayer times the home screen shows, in strict
 * precedence (PRD 03):
 *   1. home masjid set & user within ~50 km  → masjid-served azan/iqamah + Jumu'ah
 *   2. home masjid set but user >50 km away   → Travel Mode: calculated for current location
 *   3. no home masjid (guest/fresh/denied)    → calculated for current location
 * Plus offline handling: cached masjid times render instantly (React Query
 * persistence); if nothing is cached and we're offline, fall back to calculated
 * so the screen is never blank.
 *
 * Pure + deterministic (the caller supplies the calculated times) → unit-testable
 * and stable within a day (so the reminder scheduler doesn't churn).
 */
import type { City } from "@/lib/location/cities";
import { haversineMeters } from "@/lib/location/geo";
import type { Coords } from "@/lib/location/types";
import type { HomeMasjid } from "@/lib/prayer/homeMasjid";
import type { JumahResponse, PrayerTimeResponse } from "@/lib/prayer/types";

/** Distance from the home masjid beyond which Travel Mode kicks in. */
export const TRAVEL_THRESHOLD_M = 50_000;

export type HomeTimesVariant = "masjid" | "travel" | "calculated";
export type HomeTimesState = "loading" | "ready" | "needsLocation";

export interface HomeTimes {
  state: HomeTimesState;
  variant: HomeTimesVariant | null;
  /** Today's resolved times (masjid-served or calculated). */
  times: PrayerTimeResponse | null;
  /** Up-to-7-day window (masjid week or calculated range) — feeds the scheduler. */
  week: PrayerTimeResponse[];
  masjidId: string | null;
  masjidName: string | null;
  /** Nearest district (calculated/travel) — caller localizes the label. */
  district: City | null;
  jumah: JumahResponse | null;
  coords: Coords | null;
  /** True when showing cached times while the network is unreachable. */
  isOffline: boolean;
  /** When the masjid times were last fetched (for the "last updated" stamp). */
  lastUpdated: Date | null;
  /** Distance from the home masjid in km (travel variant), else null. */
  distanceKm: number | null;
  madhab: string;
  method: string;
}

export interface HomeTimesInput {
  /** Today's local date key, "YYYY-MM-DD". */
  todayStr: string;
  homeMasjid: HomeMasjid | null;
  coords: Coords | null;
  madhab: string;
  method: string;
  /** Pre-computed calculated times for today (null if no coords). */
  calcToday: PrayerTimeResponse | null;
  /** Pre-computed calculated range (feeds the scheduler in calc/travel mode). */
  calcWeek: PrayerTimeResponse[];
  /** Nearest district label source (null if no coords). */
  district: City | null;
  /** Masjid prayer-times week from `usePrayerTimes` (may be empty). */
  masjidWeek: PrayerTimeResponse[];
  masjidLoading: boolean;
  /** Derived: the latest masjid-times fetch failed (network down). */
  masjidOffline: boolean;
  masjidUpdatedAt: number | null;
  jumah: JumahResponse | null;
}

function base(state: HomeTimesState, input: HomeTimesInput): HomeTimes {
  return {
    state,
    variant: null,
    times: null,
    week: [],
    masjidId: null,
    masjidName: null,
    district: null,
    jumah: null,
    coords: input.coords,
    isOffline: false,
    lastUpdated: null,
    distanceKm: null,
    madhab: input.madhab,
    method: input.method,
  };
}

export function resolveHomeTimes(input: HomeTimesInput): HomeTimes {
  const { homeMasjid, coords, calcToday, calcWeek, district } = input;

  if (homeMasjid) {
    const dist = coords ? haversineMeters(coords, homeMasjid.coords) : null;

    // Travel Mode: away from home → calculated times for where you actually are.
    if (dist != null && dist > TRAVEL_THRESHOLD_M && calcToday) {
      return {
        ...base("ready", input),
        variant: "travel",
        times: calcToday,
        week: calcWeek,
        masjidId: homeMasjid.masjidId,
        masjidName: homeMasjid.name,
        district,
        distanceKm: dist / 1000,
      };
    }

    // Masjid-served times (cached or fresh).
    const today =
      input.masjidWeek.find((d) => d.date === input.todayStr) ?? input.masjidWeek[0] ?? null;
    if (today) {
      return {
        ...base("ready", input),
        variant: "masjid",
        times: today,
        week: input.masjidWeek,
        masjidId: homeMasjid.masjidId,
        masjidName: homeMasjid.name,
        jumah: input.jumah,
        isOffline: input.masjidOffline,
        lastUpdated: input.masjidUpdatedAt ? new Date(input.masjidUpdatedAt) : null,
      };
    }

    // No masjid data yet: show calculated as an instant offline fallback if we
    // can; otherwise we're genuinely still loading the first fetch.
    if (calcToday) {
      return {
        ...base("ready", input),
        variant: "calculated",
        times: calcToday,
        week: calcWeek,
        masjidId: homeMasjid.masjidId,
        masjidName: homeMasjid.name,
        district,
        // Only a genuine fetch failure is "offline"; an online masjid that simply
        // has no times yet falls back to calculated without an offline banner.
        isOffline: input.masjidOffline,
      };
    }
    return base(input.masjidLoading ? "loading" : "needsLocation", input);
  }

  // No home masjid → calculated for the current location.
  if (calcToday) {
    return {
      ...base("ready", input),
      variant: "calculated",
      times: calcToday,
      week: calcWeek,
      district,
    };
  }
  return base("needsLocation", input);
}
