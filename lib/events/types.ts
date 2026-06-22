/**
 * Masjid events (`GET /masjids/{id}/events`, public). Note the backend splits
 * what the client needs across two sources: this **list** carries `rsvp_enabled`
 * + `rsvp_count` but NOT the caller's own `is_rsvped`; the **feed** event item
 * (`lib/feed/types`) carries `is_rsvped` + `attendee_count` but not
 * `rsvp_enabled`. The event-detail screen reconciles both via nav params and
 * trusts the RSVP toggle's response as the authority after the first tap.
 */
import type { FeedEventItem } from "@/lib/feed/types";

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

/** Normalize a feed event item into the detail param. The feed omits
 * `rsvp_enabled`, so assume enabled — a 422 on the toggle corrects it. */
export function feedEventToDetailParam(item: FeedEventItem): EventDetailParam {
  return {
    event_id: item.event_id,
    masjid_id: item.masjid_id,
    masjid_name: item.masjid_name,
    title: item.title,
    description: item.description,
    event_date: item.event_date,
    event_time: item.event_time,
    location: item.location,
    capacity: item.capacity,
    rsvp_count: item.attendee_count,
    rsvp_enabled: true,
    is_rsvped: item.is_rsvped,
  };
}

/** Normalize a public list event into the detail param. The list can't report
 * the caller's own RSVP, so `is_rsvped` defaults to false. */
export function listEventToDetailParam(ev: EventResponse, masjidName: string): EventDetailParam {
  return {
    event_id: ev.event_id,
    masjid_id: ev.masjid_id,
    masjid_name: masjidName,
    title: ev.title,
    description: ev.description,
    event_date: ev.event_date,
    event_time: ev.event_time,
    location: ev.location,
    capacity: ev.capacity,
    rsvp_count: ev.rsvp_count,
    rsvp_enabled: ev.rsvp_enabled,
    is_rsvped: false,
  };
}
