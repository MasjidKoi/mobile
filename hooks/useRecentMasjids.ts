import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRecentMasjids, recordRecentMasjid } from "@/lib/masjids/recents";

const RECENTS_KEY = ["recents", "masjids"] as const;

/** Recently-viewed masjid IDs (on-device), kept in the query cache for cross-screen sync. */
export function useRecentMasjids() {
  const queryClient = useQueryClient();

  const { data: recents = [] } = useQuery({
    queryKey: RECENTS_KEY,
    queryFn: getRecentMasjids,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (masjidId: string) => recordRecentMasjid(masjidId),
    onSuccess: (next) => queryClient.setQueryData(RECENTS_KEY, next),
  });

  return { recents, recordView: (id: string) => mutation.mutate(id) };
}
