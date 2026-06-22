import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addGuestFavourite, getGuestData, removeGuestFavourite } from "@/lib/guest/store";

/**
 * Held in the query cache (not persisted by our disk whitelist — the guest
 * store already owns AsyncStorage) so every consumer stays in sync.
 */
const FAVOURITES_KEY = ["guest", "favourites"] as const;

/**
 * Guest favourite masjids, backed by `lib/guest/store`. Phase 2 ships the thin
 * on-device version; Phase 3 adds optimistic UI + server sync for logged-in
 * users (the migration runner already pushes these on first login).
 */
export function useFavourites() {
  const queryClient = useQueryClient();

  const { data: favourites = [] } = useQuery({
    queryKey: FAVOURITES_KEY,
    queryFn: async () => (await getGuestData()).favourites,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (masjidId: string) => {
      // Compute `next` from the current snapshot and return it directly. Don't
      // re-read the store afterwards: getGuestData fails open to [], so a
      // transient read error would otherwise wipe the favourites cache.
      const current = (await getGuestData()).favourites;
      if (current.includes(masjidId)) {
        await removeGuestFavourite(masjidId);
        return current.filter((id) => id !== masjidId);
      }
      await addGuestFavourite(masjidId);
      return [...current, masjidId];
    },
    onSuccess: (next) => queryClient.setQueryData(FAVOURITES_KEY, next),
  });

  return {
    favourites,
    isFavourite: (id: string) => favourites.includes(id),
    toggle: (id: string) => mutation.mutate(id),
  };
}
