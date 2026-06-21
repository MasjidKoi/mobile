import { useMutation } from "@tanstack/react-query";

import { createCampaignDonation, createMasjidDonation } from "@/lib/donations/api";
import type {
  CampaignDonationCreate,
  CheckoutInitResponse,
  DonationCreate,
} from "@/lib/donations/types";

/** Discriminated by `kind` so one mutation covers both masjid + campaign gifts. */
export type CreateDonationVars =
  | { kind: "masjid"; masjidId: string; body: DonationCreate }
  | { kind: "campaign"; campaignId: string; body: CampaignDonationCreate };

/**
 * Initiate a donation → returns the SSLCommerz `gateway_url`. No cache
 * invalidation here: nothing is "donated" until the gateway confirms, which the
 * status screen reconciles by polling `GET /donations/{id}`.
 */
export function useCreateDonation() {
  return useMutation<CheckoutInitResponse, unknown, CreateDonationVars>({
    mutationFn: (vars) =>
      vars.kind === "masjid"
        ? createMasjidDonation(vars.masjidId, vars.body)
        : createCampaignDonation(vars.campaignId, vars.body),
  });
}
