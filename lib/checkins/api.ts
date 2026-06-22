/**
 * CheckInsApiClient — the geofenced check-in (Bearer; callers gate it via
 * `requireAuth`) and the user's check-in history.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";

import type { CheckInHistoryResponse, CheckInResponse } from "./types";

/** `POST /masjids/{id}/checkin` — 100m server-enforced (400 too far, 404 inactive). */
export function postCheckIn(
  masjidId: string,
  body: { latitude: number; longitude: number },
): Promise<CheckInResponse> {
  return api.post<CheckInResponse>(ENDPOINTS.masjids.checkin(masjidId), body);
}

/** `GET /users/me/checkins` — paginated check-in history + lifetime count. */
export function fetchCheckInHistory(params?: {
  page?: number;
  page_size?: number;
}): Promise<CheckInHistoryResponse> {
  return api.get<CheckInHistoryResponse>(
    `${ENDPOINTS.users.checkins}${qs({ page: params?.page, page_size: params?.page_size })}`,
  );
}
