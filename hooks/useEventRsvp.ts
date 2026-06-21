import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rsvpEvent } from "@/lib/events/api";
import { qk } from "@/lib/query/keys";

/**
 * RSVP toggle for an event. The event-detail screen owns the optimistic UI
 * (seeded from nav params, since there's no single-event GET) and reconciles with
 * this mutation's `{ rsvp, rsvp_count }` response. On settle we invalidate the
 * feed-events list and the masjid's events list so counts re-sync everywhere.
 * Callers wrap the trigger in `requireAuth(..., "community")`.
 */
export function useEventRsvp(masjidId: string, eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rsvpEvent(masjidId, eventId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.feed.list("events") });
      void queryClient.invalidateQueries({ queryKey: qk.masjids.events(masjidId) });
    },
  });
}
