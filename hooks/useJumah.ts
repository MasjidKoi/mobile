import { useQuery } from "@tanstack/react-query";

import { fetchJumah } from "@/lib/masjids/api";
import { qk } from "@/lib/query/keys";

/** `GET /masjids/{id}/jumah` — Friday khutbah/jamaat schedule. */
export function useJumah(id: string | null | undefined) {
  return useQuery({
    queryKey: qk.masjids.jumah(id ?? ""),
    queryFn: () => fetchJumah(id as string),
    enabled: !!id,
  });
}
