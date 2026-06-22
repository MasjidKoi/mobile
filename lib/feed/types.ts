/**
 * Followed-masjid feed (`GET /users/me/feed`). The backend serves it
 * **type-segmented** — one query per `type` (announcements | events), each
 * cursor-paginated — rather than one merged timeline. Items carry a `kind`
 * discriminator so a single list renderer can switch on it.
 */

export type FeedType = "announcements" | "events";

export interface FeedAnnouncementItem {
  kind: "announcement";
  announcement_id: string;
  masjid_id: string;
  masjid_name: string;
  title: string;
  body: string;
  published_at: string;
  created_at: string;
}

export interface FeedEventItem {
  kind: "event";
  event_id: string;
  masjid_id: string;
  masjid_name: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  capacity: number | null;
  attendee_count: number;
  is_rsvped: boolean;
}

export type FeedItem = FeedAnnouncementItem | FeedEventItem;

/** One page of feed items; `next_cursor` is null on the last page. */
export interface FeedPage {
  items: FeedItem[];
  next_cursor: string | null;
}
