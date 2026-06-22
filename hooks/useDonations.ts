import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { fetchDonationSummary, fetchMyDonations } from "@/lib/donations/api";
import type { DonationHistoryFilters } from "@/lib/donations/types";
import { qk } from "@/lib/query/keys";

/** `GET /me/donations` — keyset-paginated history, filtered, for the dashboard. */
export function useMyDonations(filters?: DonationHistoryFilters) {
  return useInfiniteQuery({
    queryKey: qk.donations.mine(filters),
    queryFn: ({ pageParam }) => fetchMyDonations({ filters, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
  });
}

/** `GET /me/donations/summary` — lifetime + this-year totals for the header. */
export function useDonationSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: qk.donations.summary(),
    queryFn: () => fetchDonationSummary(),
    enabled: options?.enabled ?? true,
  });
}
