import { useQuery } from "@tanstack/react-query";

import { fetchAnsweredQuestions } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

const HOUR_MS = 60 * 60 * 1000;

/**
 * `GET /masjids/{id}/questions` — the public, answered-only Q&A for a masjid
 * (renders as a FAQ). Also surfaced first when a user is about to ask, to
 * deflect duplicates. Disabled until `id` is known.
 */
export function useAnsweredQuestions(id: string | null | undefined) {
  return useQuery({
    queryKey: qk.masjids.answeredQuestions(id ?? ""),
    queryFn: () => fetchAnsweredQuestions(id as string, { page_size: 50 }),
    enabled: !!id,
    staleTime: HOUR_MS,
    gcTime: 24 * HOUR_MS,
  });
}
