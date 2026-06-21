import { useQuery } from "@tanstack/react-query";

import { fetchMyPhotoSubmissions } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

/**
 * `GET /me/photo-submissions` — the signed-in user's community-photo
 * submissions with moderation status. Requires auth; pass `enabled` to gate it
 * on `isAuthenticated`.
 */
export function useMyPhotoSubmissions(enabled = true) {
  return useQuery({
    queryKey: qk.photoSubmissions.mine(),
    queryFn: fetchMyPhotoSubmissions,
    enabled,
  });
}
