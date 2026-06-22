/**
 * Community reads scoped to a masjid: announcements (Phase 8a) and events
 * (consumed by Phase 8b's `lib/events`). All are **public** (`auth: false`) so
 * guests can read a masjid's announcements/events from its profile; the feed
 * (`lib/feed`) is the authenticated, followed-only view of the same content.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { qs } from "./api";

// ---- Announcements ----------------------------------------------------------

export interface AnnouncementResponse {
  announcement_id: string;
  masjid_id: string;
  title: string;
  body: string;
  is_published: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  posted_by_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementListResponse {
  items: AnnouncementResponse[];
  total: number;
  page: number;
  page_size: number;
}

/** `GET /masjids/{id}/announcements` — published announcements, newest first. */
export function fetchAnnouncements(
  id: string,
  params?: { page?: number; page_size?: number },
): Promise<AnnouncementListResponse> {
  return api.get<AnnouncementListResponse>(
    `${ENDPOINTS.masjids.announcements(id)}${qs({
      page: params?.page,
      page_size: params?.page_size,
    })}`,
    { auth: false },
  );
}

/** `GET /masjids/{id}/announcements/{aid}` — single announcement (detail screen). */
export function fetchAnnouncement(
  id: string,
  announcementId: string,
): Promise<AnnouncementResponse> {
  return api.get<AnnouncementResponse>(
    ENDPOINTS.masjids.announcementById(id, announcementId),
    { auth: false },
  );
}
