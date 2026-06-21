import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { ApiError } from "@/lib/api/errors";
import { followMasjid, unfollowMasjid } from "@/lib/masjids/profile-api";
import type { NotificationPreferences } from "@/lib/notifications/preferences";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Follow toggle for the profile header. Phase 8 makes this **authoritative**:
 * the followed set lives in the notification-preferences `masjids[]` (the backend
 * has no per-masjid "am I following?" read), so `isFollowing` is derived from
 * that cache and is correct on a cold profile load — not just after a toggle. The
 * mutation optimistically patches the same cache (so the button, the Notifications
 * rows, and the Masjids-I-Follow list all flip together), then invalidates prefs
 * + the feed on settle. A 409/404 "already in the desired state" is treated as
 * success so the toggle never gets stuck.
 *
 * `name` (the masjid's name, available on the profile) lets the optimistic insert
 * show a real name before the refetch reconciles. Callers must wrap `toggle` in
 * `requireAuth(..., "community")`.
 */
export function useFollow(id: string | null | undefined, name?: string | null) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const prefsKey = qk.notificationPrefs();

  // Reading prefs here populates the cache on profile view (authed only); the
  // Notifications screen reads the same query.
  const { prefs } = useNotificationPreferences({ enabled: isAuthenticated });
  const isFollowing = !!id && !!prefs?.masjids.some((m) => m.masjid_id === id);

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      try {
        if (next) await followMasjid(id as string);
        else await unfollowMasjid(id as string);
      } catch (e) {
        // Tolerate only the "already in the desired state" conflicts: following an
        // already-followed masjid (409), or unfollowing one that isn't (404).
        if (e instanceof ApiError && ((next && e.status === 409) || (!next && e.status === 404))) {
          return next;
        }
        throw e;
      }
      return next;
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: prefsKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(prefsKey);
      if (previous && id) {
        const masjids = next
          ? previous.masjids.some((m) => m.masjid_id === id)
            ? previous.masjids
            : [
                ...previous.masjids,
                { masjid_id: id, name: name ?? "", notification_mode: "digest" as const },
              ]
          : previous.masjids.filter((m) => m.masjid_id !== id);
        queryClient.setQueryData<NotificationPreferences>(prefsKey, { ...previous, masjids });
      }
      return { previous };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(prefsKey, ctx.previous);
    },
    onSettled: () => {
      // 204/no-body writes — reconcile prefs with the server, and refresh the feed
      // (a new follow adds its masjid's items; an unfollow drops them).
      void queryClient.invalidateQueries({ queryKey: prefsKey });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return {
    isFollowing,
    isPending: mutation.isPending,
    toggle: () => {
      if (!id) return;
      // Read the live cache at tap time (not the render-closed `isFollowing`) so a
      // fast double-tap can't fire the same target state twice.
      const current = !!queryClient
        .getQueryData<NotificationPreferences>(prefsKey)
        ?.masjids.some((m) => m.masjid_id === id);
      mutation.mutate(!current);
    },
  };
}
