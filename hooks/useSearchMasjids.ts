import { useQuery } from "@tanstack/react-query";

import { roundCoords } from "@/lib/location/coords";
import type { Coords } from "@/lib/location/types";
import { fetchSearch } from "@/lib/masjids/api";
import { qk } from "@/lib/query/keys";

/**
 * `GET /masjids/search`. Disabled until the (trimmed) query is ≥2 chars — the
 * backend minimum. Pass `coords` to bias results by distance. Debounce belongs
 * in the calling screen (Phase 3).
 */
export function useSearchMasjids(query: string, coords?: Coords | null) {
  const trimmed = query.trim();
  // Quantize the distance-bias coords so GPS jitter doesn't re-key the search.
  const q = coords ? roundCoords(coords) : null;
  return useQuery({
    queryKey: qk.masjids.search(trimmed, q),
    queryFn: () => fetchSearch(trimmed, q),
    enabled: trimmed.length >= 2,
  });
}
