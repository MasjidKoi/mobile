import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { followMasjid, unfollowMasjid } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

/**
 * Follow toggle for the profile header. ⚠️ Phase-5 boundary: the backend has no
 * per-masjid "am I following?" read yet (it lands with the Phase 8 follows
 * list), so this state is **session-optimistic** — it seeds to `false` and is
 * authoritative only after the user toggles. The mutation writes the edge
 * (`POST`/`DELETE /masjids/{id}/follow`); a 409/404 conflict (already in the
 * desired state) is treated as success so the toggle never gets stuck.
 *
 * Callers must wrap `toggle` in `requireAuth(..., "community")`.
 */
export function useFollow(id: string | null | undefined) {
  const queryClient = useQueryClient();
  const key = qk.follows.status(id ?? "");

  // A local cache cell, never fetched — purely holds the optimistic edge state.
  const { data: isFollowing = false } = useQuery({
    queryKey: key,
    queryFn: () => queryClient.getQueryData<boolean>(key) ?? false,
    enabled: !!id,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      try {
        if (next) await followMasjid(id as string);
        else await unfollowMasjid(id as string);
      } catch (e) {
        // Tolerate only the "already in the desired state" conflicts: following
        // an already-followed masjid (409), or unfollowing one that isn't
        // followed (404). A 404 while *following* is a real error (bad id) and
        // must not be silently committed as success.
        if (e instanceof ApiError && ((next && e.status === 409) || (!next && e.status === 404))) {
          return next;
        }
        throw e;
      }
      return next;
    },
    onMutate: (next) => {
      const prev = queryClient.getQueryData<boolean>(key) ?? false;
      queryClient.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx) queryClient.setQueryData(key, ctx.prev);
    },
    onSuccess: (next) => queryClient.setQueryData(key, next),
  });

  return {
    isFollowing,
    isPending: mutation.isPending,
    toggle: () => {
      if (!id) return;
      // Read the live cache value at tap time (not the render-closed `isFollowing`)
      // so a fast double-tap can't fire the same target state twice.
      const current = queryClient.getQueryData<boolean>(key) ?? false;
      mutation.mutate(!current);
    },
  };
}
