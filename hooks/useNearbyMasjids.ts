import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { roundCoords } from "@/lib/location/coords";
import type { Coords } from "@/lib/location/types";
import { fetchNearby } from "@/lib/masjids/api";
import type { MasjidFacilityFilters } from "@/lib/masjids/types";
import { qk } from "@/lib/query/keys";

export interface UseNearbyMasjidsOptions {
  filters?: MasjidFacilityFilters;
  /** Search radius in metres (backend default 5000, max 50000). */
  radiusM?: number;
  /** Force-disable even when coords exist. */
  enabled?: boolean;
}

/**
 * `GET /masjids/nearby` for the resolved location. Disabled until `coords`
 * exist (e.g. a guest who hasn't granted location or picked a city yet). Public
 * endpoint — no auth. Cached-first: persisted to AsyncStorage for offline reads.
 */
export function useNearbyMasjids(
  coords: Coords | null | undefined,
  options?: UseNearbyMasjidsOptions,
) {
  const { filters, radiusM, enabled = true } = options ?? {};
  // Quantize coords so GPS jitter doesn't spawn a new key + refetch each fix.
  const q = coords ? roundCoords(coords) : null;
  return useQuery({
    queryKey: qk.masjids.nearby({
      lat: q?.lat ?? 0,
      lng: q?.lng ?? 0,
      radius_m: radiusM,
      filters,
    }),
    queryFn: () => fetchNearby(q as Coords, filters, radiusM),
    enabled: enabled && !!q,
    // Keep the prior results on screen while a new radius/filter combo loads,
    // so the list dims instead of blanking to a full-screen spinner (and scroll
    // position survives) — matching the map view's behaviour.
    placeholderData: keepPreviousData,
  });
}
