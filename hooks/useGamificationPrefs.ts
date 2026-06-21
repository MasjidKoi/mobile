import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DEFAULT_GAMIFICATION_PREFS,
  getGamificationPrefs,
  setGamificationPrefs,
  type GamificationPrefs,
} from "@/lib/notifications/gamificationPrefs";

/** Held in the query cache (the store owns AsyncStorage) for cross-screen sync. */
const GAMIFICATION_PREFS_KEY = ["gamificationPrefs"] as const;

/**
 * Local gamification nudge preferences (Journal Setup, screen 111). The
 * `NudgeScheduler` effect watches this query and reschedules whenever it
 * changes, so screens only need to call `setPrefs(patch)`.
 */
export function useGamificationPrefs() {
  const queryClient = useQueryClient();

  const { data: prefs = DEFAULT_GAMIFICATION_PREFS, isLoading } = useQuery({
    queryKey: GAMIFICATION_PREFS_KEY,
    queryFn: getGamificationPrefs,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (patch: Partial<GamificationPrefs>) => setGamificationPrefs(patch),
    onSuccess: (next) => queryClient.setQueryData(GAMIFICATION_PREFS_KEY, next),
  });

  return {
    prefs,
    isLoading,
    setPrefs: (patch: Partial<GamificationPrefs>) => mutation.mutate(patch),
  };
}
