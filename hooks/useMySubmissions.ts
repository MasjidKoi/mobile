import { useQuery } from "@tanstack/react-query";

import { fetchMySubmissions } from "@/lib/masjids/submissions";
import { qk } from "@/lib/query/keys";

/**
 * `GET /me/submissions` — the signed-in user's masjid submissions with review
 * status. Requires auth; pass `enabled` to gate it on `isAuthenticated`.
 */
export function useMySubmissions(enabled = true) {
  return useQuery({
    queryKey: qk.submissions.mine(),
    queryFn: fetchMySubmissions,
    enabled,
  });
}
