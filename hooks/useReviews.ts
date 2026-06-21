import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteReview, fetchReviews, upsertReview, type ReviewUpsert } from "@/lib/reviews/api";
import { qk } from "@/lib/query/keys";

const PAGE_SIZE = 20;

/** `GET /masjids/{id}/reviews` — paginated review list (public, cached under the
 * masjids persistence root). Page-based pagination: derive the next page from
 * the running loaded-count vs `total`. */
export function useReviews(masjidId: string | null | undefined) {
  return useInfiniteQuery({
    queryKey: qk.masjids.reviews(masjidId ?? ""),
    queryFn: ({ pageParam }) => fetchReviews(masjidId as string, { page: pageParam, page_size: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled: !!masjidId,
  });
}

/** `PUT /masjids/{id}/reviews` — create/replace the caller's review, then refresh
 * the list + the profile aggregate. */
export function useReviewUpsert(masjidId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewUpsert) => upsertReview(masjidId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.masjids.reviews(masjidId) });
      void queryClient.invalidateQueries({ queryKey: qk.masjids.reviewsSummary(masjidId) });
    },
  });
}

/** `DELETE /masjids/{id}/reviews/{rid}` — remove the caller's review. */
export function useReviewDelete(masjidId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(masjidId, reviewId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.masjids.reviews(masjidId) });
      void queryClient.invalidateQueries({ queryKey: qk.masjids.reviewsSummary(masjidId) });
    },
  });
}
