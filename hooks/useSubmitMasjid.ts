import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitMasjid, type MasjidSubmissionCreate } from "@/lib/masjids/submissions";
import { qk } from "@/lib/query/keys";

/**
 * `POST /masjids/submissions`. On success, invalidates the My Submissions list
 * so the new (pending) entry shows up. Surfaces backend rate-limits via the
 * thrown `ApiError` (status 429 + `retryAfterSeconds`).
 */
export function useSubmitMasjid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: MasjidSubmissionCreate) => submitMasjid(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.submissions.mine() }),
  });
}
