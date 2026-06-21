import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadCommunityPhoto } from "@/lib/masjids/profile-api";
import type { SubmissionPhotoAsset } from "@/lib/masjids/submissions";
import { qk } from "@/lib/query/keys";

/**
 * `POST /masjids/{id}/community-photos` — upload a visitor photo (auth + rate-
 * limited; a 429 surfaces as `ApiError` so the caller can show the rate-limit
 * state). The photo enters moderation as `pending`; on success the user's
 * photo-submissions list is refreshed.
 */
export function useUploadCommunityPhoto(masjidId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset: SubmissionPhotoAsset) => uploadCommunityPhoto(masjidId, asset),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.photoSubmissions.mine() });
    },
  });
}
