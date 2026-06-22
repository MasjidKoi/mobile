import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DEFAULT_REMINDER_PREFS,
  getReminderPrefs,
  setReminderPrefs,
  type ReminderPrefsPatch,
} from "@/lib/notifications/settingsStore";

/** Held in the query cache (the store owns AsyncStorage) for cross-screen sync. */
const REMINDER_PREFS_KEY = ["reminderPrefs"] as const;

/**
 * Local prayer-reminder preferences. The app-wide reminder scheduler effect
 * watches this query and reschedules whenever it changes, so screens only need
 * to call `setPrefs(patch)`.
 */
export function useReminderPrefs() {
  const queryClient = useQueryClient();

  const { data: prefs = DEFAULT_REMINDER_PREFS, isLoading } = useQuery({
    queryKey: REMINDER_PREFS_KEY,
    queryFn: getReminderPrefs,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (patch: ReminderPrefsPatch) => setReminderPrefs(patch),
    onSuccess: (next) => queryClient.setQueryData(REMINDER_PREFS_KEY, next),
  });

  return {
    prefs,
    isLoading,
    setPrefs: (patch: ReminderPrefsPatch) => mutation.mutate(patch),
  };
}
