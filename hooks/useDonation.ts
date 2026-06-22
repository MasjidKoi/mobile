import { useQuery } from "@tanstack/react-query";

import { fetchDonation } from "@/lib/donations/api";
import { qk } from "@/lib/query/keys";

const POLL_MS = 2500;

/**
 * `GET /donations/{id}` — a single donation. On the post-payment status screen
 * pass `{ poll: true }`: while the donation is still `pending` (gateway hasn't
 * confirmed) it refetches every few seconds, then stops once it resolves to
 * completed/failed/refunded. Used read-only (history → detail) without polling.
 */
export function useDonation(id: string | null | undefined, opts?: { poll?: boolean }) {
  return useQuery({
    queryKey: qk.donations.detail(id ?? ""),
    queryFn: () => fetchDonation(id as string),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) =>
      opts?.poll && query.state.data?.status === "pending" ? POLL_MS : false,
  });
}
