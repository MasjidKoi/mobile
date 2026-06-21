import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchNotificationPreferences,
  setFollowNotificationMode,
  updateNotificationPreferences,
  type NotificationMode,
  type NotificationPreferences,
  type NotificationPreferencesUpdate,
} from "@/lib/notifications/preferences";
import { qk } from "@/lib/query/keys";

/**
 * Server notification preferences (PRD 09 #27–28 / PRD 05). Reads the digest
 * hour, global mute toggles, donate-anonymously default, and the followed-masjid
 * list with each masjid's mode. Patches are optimistic so toggles feel instant;
 * the per-masjid mode change writes through `PATCH /masjids/{id}/follow` and
 * patches the cached list in place.
 */
export function useNotificationPreferences(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const key = qk.notificationPrefs();

  const query = useQuery({
    queryKey: key,
    queryFn: fetchNotificationPreferences,
    enabled: options?.enabled ?? true,
  });

  const patch = useMutation({
    mutationFn: (update: NotificationPreferencesUpdate) =>
      updateNotificationPreferences(update),
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPreferences>(key);
      if (previous)
        queryClient.setQueryData<NotificationPreferences>(key, {
          ...previous,
          ...update,
        });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: (data) => queryClient.setQueryData(key, data),
  });

  const setMode = useMutation({
    mutationFn: ({
      masjidId,
      mode,
    }: {
      masjidId: string;
      mode: NotificationMode;
    }) => setFollowNotificationMode(masjidId, mode),
    onMutate: async ({ masjidId, mode }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPreferences>(key);
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(key, {
          ...previous,
          masjids: previous.masjids.map((m) =>
            m.masjid_id === masjidId ? { ...m, notification_mode: mode } : m,
          ),
        });
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    // The PATCH returns 204 (no body), so reconcile the optimistic value with the
    // server's canonical state once the change settles.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });

  return {
    prefs: query.data,
    query,
    setPref: (update: NotificationPreferencesUpdate) => patch.mutate(update),
    setMode: (masjidId: string, mode: NotificationMode) =>
      setMode.mutate({ masjidId, mode }),
  };
}
