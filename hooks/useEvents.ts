import { useQuery } from "@tanstack/react-query";

import { fetchEvents } from "@/lib/events/api";
import { qk } from "@/lib/query/keys";

/** `GET /masjids/{id}/events` — a masjid's upcoming events (public, cached under
 * the masjids persistence root so a viewed profile's events survive offline). */
export function useEvents(masjidId: string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: qk.masjids.events(masjidId ?? ""),
    queryFn: () => fetchEvents(masjidId as string),
    enabled: !!masjidId && (options?.enabled ?? true),
  });
}
