import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearHomeMasjidStore,
  getHomeMasjid,
  setHomeMasjidStore,
  type HomeMasjid,
} from "@/lib/prayer/homeMasjid";

/** Held in the query cache (the store owns AsyncStorage) for cross-screen sync. */
const HOME_MASJID_KEY = ["homeMasjid"] as const;

/** The on-device home masjid, mirroring the `useFavourites`/`useRecentMasjids` pattern. */
export function useHomeMasjid() {
  const queryClient = useQueryClient();

  const { data: homeMasjid = null } = useQuery({
    queryKey: HOME_MASJID_KEY,
    queryFn: getHomeMasjid,
    staleTime: Infinity,
  });

  const setMutation = useMutation({
    mutationFn: (home: HomeMasjid) => setHomeMasjidStore(home),
    onSuccess: (next) => queryClient.setQueryData(HOME_MASJID_KEY, next),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await clearHomeMasjidStore();
      return null;
    },
    onSuccess: () => queryClient.setQueryData(HOME_MASJID_KEY, null),
  });

  return {
    homeMasjid,
    setHomeMasjid: (home: HomeMasjid) => setMutation.mutate(home),
    clearHomeMasjid: () => clearMutation.mutate(),
  };
}
