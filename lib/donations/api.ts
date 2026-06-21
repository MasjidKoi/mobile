/**
 * DonationApiClient — typed fetchers over the donation + recurring endpoints.
 * Everything here is **Bearer-authenticated** (donor-scoped); callers gate the
 * write paths via `requireAuth`. Hooks in `hooks/` wrap these with React Query.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";

import type {
  CampaignDonationCreate,
  CheckoutInitResponse,
  DonationCreate,
  DonationHistoryFilters,
  DonationHistoryResponse,
  DonationStatusResponse,
  DonationSummary,
  RecurringSchedule,
  RecurringScheduleCreate,
  RecurringScheduleListResponse,
  RecurringScheduleUpdate,
} from "./types";

// ---- Create (checkout init) -------------------------------------------------

export function createMasjidDonation(
  masjidId: string,
  body: DonationCreate,
): Promise<CheckoutInitResponse> {
  return api.post<CheckoutInitResponse>(ENDPOINTS.masjids.donations(masjidId), body);
}

export function createCampaignDonation(
  campaignId: string,
  body: CampaignDonationCreate,
): Promise<CheckoutInitResponse> {
  return api.post<CheckoutInitResponse>(ENDPOINTS.campaigns.donations(campaignId), body);
}

// ---- Read -------------------------------------------------------------------

export function fetchDonation(id: string): Promise<DonationStatusResponse> {
  return api.get<DonationStatusResponse>(ENDPOINTS.donations.byId(id));
}

/** `GET /me/donations` — keyset paginated. `cursor` is the previous page's `next_cursor`. */
export function fetchMyDonations(params?: {
  filters?: DonationHistoryFilters;
  cursor?: string | null;
  limit?: number;
}): Promise<DonationHistoryResponse> {
  return api.get<DonationHistoryResponse>(
    `${ENDPOINTS.me.donations}${qs({
      ...params?.filters,
      cursor: params?.cursor ?? undefined,
      limit: params?.limit,
    })}`,
  );
}

export function fetchDonationSummary(): Promise<DonationSummary> {
  return api.get<DonationSummary>(ENDPOINTS.me.donationsSummary);
}

// ---- Recurring schedules ----------------------------------------------------

export function fetchRecurringSchedules(): Promise<RecurringScheduleListResponse> {
  return api.get<RecurringScheduleListResponse>(ENDPOINTS.me.recurring);
}

export function createRecurringSchedule(
  body: RecurringScheduleCreate,
): Promise<RecurringSchedule> {
  return api.post<RecurringSchedule>(ENDPOINTS.me.recurring, body);
}

export function updateRecurringSchedule(
  id: string,
  body: RecurringScheduleUpdate,
): Promise<RecurringSchedule> {
  return api.patch<RecurringSchedule>(ENDPOINTS.me.recurringById(id), body);
}

export function cancelRecurringSchedule(id: string): Promise<unknown> {
  return api.delete<unknown>(ENDPOINTS.me.recurringById(id));
}
