/**
 * EventsApiClient — the public masjid events list (read) and the RSVP toggle
 * (Bearer; callers gate it via `requireAuth`). Hooks in `hooks/` wrap these.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";

import type { EventListResponse, EventRsvpResponse } from "./types";

/** `GET /masjids/{id}/events` — upcoming events for a masjid (public). */
export function fetchEvents(
  id: string,
  params?: { page?: number; page_size?: number },
): Promise<EventListResponse> {
  return api.get<EventListResponse>(
    `${ENDPOINTS.masjids.events(id)}${qs({ page: params?.page, page_size: params?.page_size })}`,
    { auth: false },
  );
}

/**
 * `POST /masjids/{id}/events/{eid}/rsvp` — toggle the caller's RSVP. Returns the
 * resulting `{ rsvp, rsvp_count }`. Throws `409` if the event is at capacity and
 * `422` if RSVP isn't enabled for it.
 */
export function rsvpEvent(masjidId: string, eventId: string): Promise<EventRsvpResponse> {
  return api.post<EventRsvpResponse>(ENDPOINTS.masjids.eventRsvp(masjidId, eventId));
}
