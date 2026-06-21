import type { CampaignResponse } from "@/lib/masjids/profile-api";

import { useCampaigns } from "./useCampaigns";

/**
 * A single campaign, selected from the masjid's cached campaigns list — the
 * backend has no `GET /campaigns/{id}`, and the profile already warmed
 * `qk.masjids.campaigns(masjidId)`, so the detail screen opens instantly with
 * no extra request.
 */
export function useCampaign(masjidId: string | null | undefined, campaignId: string) {
  const query = useCampaigns(masjidId);
  const campaign: CampaignResponse | null =
    query.data?.items.find((c) => c.campaign_id === campaignId) ?? null;
  return { campaign, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
