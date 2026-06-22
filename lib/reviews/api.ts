/**
 * ReviewsApiClient — the full reviews list (public read) plus the upsert/delete
 * writes (Bearer; callers gate them via `requireAuth`). The aggregate-only
 * `fetchReviewsSummary` lives in `profile-api.ts`; the `MasjidReview` /
 * `ReviewListResponse` types are reused from there.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";
import type { MasjidReview, ReviewListResponse } from "@/lib/masjids/profile-api";

/** The backend rejects a 1–2★ review whose body is under this length (422). */
export const LOW_STAR_MIN_BODY = 20;

/** A review is "low-star" (needs a written reason) at 1 or 2 stars. */
export function isLowStar(rating: number): boolean {
  return rating > 0 && rating <= 2;
}

export interface ReviewUpsert {
  rating: number;
  body?: string | null;
}

/** `GET /masjids/{id}/reviews` — paginated, newest first, public. */
export function fetchReviews(
  id: string,
  params?: { page?: number; page_size?: number },
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(
    `${ENDPOINTS.masjids.reviews(id)}${qs({ page: params?.page, page_size: params?.page_size })}`,
    { auth: false },
  );
}

/** `PUT /masjids/{id}/reviews` — create or replace the caller's review. */
export function upsertReview(id: string, body: ReviewUpsert): Promise<MasjidReview> {
  return api.put<MasjidReview>(ENDPOINTS.masjids.reviews(id), body);
}

/** `DELETE /masjids/{id}/reviews/{rid}` — remove the caller's review. */
export function deleteReview(id: string, reviewId: string): Promise<unknown> {
  return api.delete<unknown>(ENDPOINTS.masjids.reviewById(id, reviewId));
}
