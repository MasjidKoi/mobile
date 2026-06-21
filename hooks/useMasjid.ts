import { useQuery } from "@tanstack/react-query";

import { fetchMasjid } from "@/lib/masjids/api";
import { qk } from "@/lib/query/keys";

/** `GET /masjids/{id}` — full masjid detail. Disabled until `id` is known. */
export function useMasjid(id: string | null | undefined) {
  return useQuery({
    queryKey: qk.masjids.detail(id ?? ""),
    queryFn: () => fetchMasjid(id as string),
    enabled: !!id,
  });
}
