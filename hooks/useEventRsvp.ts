import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import type { EventListResponse } from "@/lib/events/types";
import { rsvpEvent } from "@/lib/events/api";
import type { FeedPage } from "@/lib/feed/types";
import { qk } from "@/lib/query/keys";

/**
 * RSVP toggle for an event. The event-detail screen owns its own optimistic UI
 * (seeded from nav params, since there's no single-event GET). On success we
 * write the authoritative `{ rsvp, rsvp_count }` straight into the masjid's
 * events list and the feed-events cache so their cards update immediately — and
 * stay correct offline, where the follow-up invalidation has nothing to refetch.
 * Callers wrap the trigger in `requireAuth(..., "community")`.
 */
export function useEventRsvp(masjidId: string, eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rsvpEvent(masjidId, eventId),
    onSuccess: (res) => {
      queryClient.setQueryData<EventListResponse>(qk.masjids.events(masjidId), (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((e) =>
                e.event_id === eventId ? { ...e, rsvp_count: res.rsvp_count } : e,
              ),
            }
          : prev,
      );
      queryClient.setQueryData<InfiniteData<FeedPage>>(qk.feed.list("events"), (prev) =>
        prev
          ? {
              ...prev,
              pages: prev.pages.map((pg) => ({
                ...pg,
                items: pg.items.map((it) =>
                  it.kind === "event" && it.event_id === eventId
                    ? { ...it, attendee_count: res.rsvp_count, is_rsvped: res.rsvp }
                    : it,
                ),
              })),
            }
          : prev,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.feed.list("events") });
      void queryClient.invalidateQueries({ queryKey: qk.masjids.events(masjidId) });
    },
  });
}
