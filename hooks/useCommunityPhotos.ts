import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchCommunityPhotos } from "@/lib/masjids/profile-api";
import { qk } from "@/lib/query/keys";

const PAGE_SIZE = 12;
const HOUR_MS = 60 * 60 * 1000;

/**
 * `GET /masjids/{id}/community-photos` — approved visitor photos as a lazy,
 * paginated strip (kept separate from the admin gallery). Disabled until `id`
 * is known; `fetchNextPage` advances while more remain.
 */
export function useCommunityPhotos(id: string | null | undefined) {
  return useInfiniteQuery({
    queryKey: qk.masjids.communityPhotos(id ?? ""),
    queryFn: ({ pageParam }) =>
      fetchCommunityPhotos(id as string, { page: pageParam, page_size: PAGE_SIZE }),
    enabled: !!id,
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const loaded = last.page * last.page_size;
      return loaded < last.total ? last.page + 1 : undefined;
    },
    staleTime: HOUR_MS,
    gcTime: 24 * HOUR_MS,
  });
}
