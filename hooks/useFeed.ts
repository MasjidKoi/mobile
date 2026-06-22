import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchFeed } from "@/lib/feed/api";
import type { FeedType } from "@/lib/feed/types";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/AuthProvider";

/**
 * `GET /users/me/feed` — the followed-masjid feed, one `type` at a time
 * (announcements | events), cursor-paginated. Gated on auth: guests get the
 * Feed-Guest variant instead, so the query stays disabled for them. Persisted
 * (see `lib/query/persister.ts`) so it hydrates for the Feed-Offline variant.
 */
export function useFeed(type: FeedType) {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: qk.feed.list(type),
    queryFn: ({ pageParam }) => fetchFeed({ type, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    enabled: isAuthenticated,
  });
}
