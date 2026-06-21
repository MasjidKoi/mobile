import { useQuery } from "@tanstack/react-query";

import { fetchMyQuestions } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

/**
 * `GET /me/questions` — the signed-in user's asked questions with moderation
 * status (pending | answered | rejected). Requires auth; pass `enabled` to gate
 * it on `isAuthenticated`.
 */
export function useMyQuestions(enabled = true) {
  return useQuery({
    queryKey: qk.questions.mine(),
    queryFn: fetchMyQuestions,
    enabled,
  });
}
