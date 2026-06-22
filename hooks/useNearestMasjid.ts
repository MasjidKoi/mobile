import { useMemo } from "react";

import type { Coords } from "@/lib/location/types";
import type { MasjidNearbyResult } from "@/lib/masjids/types";
import { useLocation } from "@/providers/LocationProvider";

import { useNearbyMasjids, type UseNearbyMasjidsOptions } from "./useNearbyMasjids";

export interface UseNearestMasjidResult {
  /** The single closest masjid to the resolved location, or null. */
  masjid: MasjidNearbyResult | null;
  coords: Coords | null;
  isLoading: boolean;
  isError: boolean;
  /** Re-runs the nearby query; awaitable (e.g. pull-to-refresh). */
  refetch: () => Promise<unknown>;
}

/**
 * The closest masjid to the resolved location — feeds the Home hero card
 * (`NearestMasjidCard`). Reads location from `useLocation()` so callers don't
 * thread coords through. (`/masjids/nearby` already sorts by distance; the
 * reduce is a defensive min in case ordering ever changes.)
 */
export function useNearestMasjid(options?: UseNearbyMasjidsOptions): UseNearestMasjidResult {
  const { coords } = useLocation();
  const query = useNearbyMasjids(coords, options);

  const masjid = useMemo(() => {
    const list = query.data;
    if (!list || list.length === 0) return null;
    return list.reduce((min, m) => (m.distance_m < min.distance_m ? m : min));
  }, [query.data]);

  return {
    masjid,
    coords,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}
