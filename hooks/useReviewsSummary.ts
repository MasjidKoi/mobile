import { useQuery } from "@tanstack/react-query";

import { fetchReviewsSummary } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

const HOUR_MS = 60 * 60 * 1000;

/**
 * `GET /masjids/{id}/reviews` (smallest page) — Phase 5 surfaces only the
 * aggregate (`average_rating` + `total`) for the header rating and the reserved
 * Reviews slot. The full list + write-review land in Phase 8.
 */
export function useReviewsSummary(id: string | null | undefined) {
  return useQuery({
    queryKey: qk.masjids.reviewsSummary(id ?? ""),
    queryFn: () => fetchReviewsSummary(id as string),
    enabled: !!id,
    staleTime: HOUR_MS,
    gcTime: 24 * HOUR_MS,
  });
}
