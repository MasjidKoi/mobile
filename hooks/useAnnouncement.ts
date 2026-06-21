import { useQuery } from "@tanstack/react-query";

import { fetchAnnouncement } from "@/lib/masjids/community-api";
import { qk } from "@/lib/query/keys";

/** `GET /masjids/{id}/announcements/{aid}` — single announcement (public, cached). */
export function useAnnouncement(
  masjidId: string | null | undefined,
  announcementId: string | null | undefined,
) {
  return useQuery({
    queryKey: qk.masjids.announcement(masjidId ?? "", announcementId ?? ""),
    queryFn: () => fetchAnnouncement(masjidId as string, announcementId as string),
    enabled: !!masjidId && !!announcementId,
  });
}
