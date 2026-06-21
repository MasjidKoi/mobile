import { useMutation, useQueryClient } from "@tanstack/react-query";

import { askQuestion } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

/**
 * `POST /masjids/{id}/questions` — ask the masjid a question (auth + rate-
 * limited; a 429 surfaces as `ApiError` for the caller to present). On success
 * the question lands in the asker's "My questions" list as `pending`.
 */
export function useAskQuestion(masjidId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: string) => askQuestion(masjidId, question),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.questions.mine() });
    },
  });
}
