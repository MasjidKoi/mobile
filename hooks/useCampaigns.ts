import { useQuery } from "@tanstack/react-query";

import { fetchCampaigns } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

const HOUR_MS = 60 * 60 * 1000;

/**
 * `GET /masjids/{id}/campaigns` — the masjid's active fundraising campaigns for
 * the profile donate section. Disabled until `id` is known. Persisted with the
 * profile so the donate section survives offline.
 */
export function useCampaigns(id: string | null | undefined) {
  return useQuery({
    queryKey: qk.masjids.campaigns(id ?? ""),
    queryFn: () => fetchCampaigns(id as string, { status: "Active" }),
    enabled: !!id,
    staleTime: HOUR_MS,
    gcTime: 24 * HOUR_MS,
  });
}
