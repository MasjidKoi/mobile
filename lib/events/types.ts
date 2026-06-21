/**
 * Masjid events (`GET /masjids/{id}/events`, public). Note the backend splits
 * what the client needs across two sources: this **list** carries `rsvp_enabled`
 * + `rsvp_count` but NOT the caller's own `is_rsvped`; the **feed** event item
 * (`lib/feed/types`) carries `is_rsvped` + `attendee_count` but not
 * `rsvp_enabled`. The event-detail screen reconciles both via nav params and
 * trusts the RSVP toggle's response as the authority after the first tap.
 */

export interface EventResponse {
  event_id: string;
  masjid_id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  capacity: number | null;
  rsvp_enabled: boolean;
  rsvp_count: number;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventListResponse {
  items: EventResponse[];
  total: number;
  page: number;
  page_size: number;
}

/** `POST /masjids/{id}/events/{eid}/rsvp` — toggles, returns the resulting state. */
export interface EventRsvpResponse {
  rsvp: boolean;
  rsvp_count: number;
}

/**
 * The normalized event the detail screen renders, passed via nav params so the
 * screen needs no single-GET (the backend has none). Built from a feed item or a
 * list item; `is_rsvped`/`rsvp_enabled` default per the gaps noted above.
 */
export interface EventDetailParam {
  event_id: string;
  masjid_id: string;
  masjid_name: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  capacity: number | null;
  rsvp_count: number;
  rsvp_enabled: boolean;
  is_rsvped: boolean;
}
