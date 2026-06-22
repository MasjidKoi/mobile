/**
 * FeedApiClient — the followed-masjid feed. Bearer-authenticated (it reads
 * `/users/me/feed`); guests never reach it (the Feed tab gates them). Hooks in
 * `hooks/useFeed.ts` wrap this with an infinite query keyed by `type`.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";

import type { FeedPage, FeedType } from "./types";

/** `GET /users/me/feed?type=&cursor=&limit=` — cursor-paginated, one `type` at a time. */
export function fetchFeed(params: {
  type: FeedType;
  cursor?: string | null;
  limit?: number;
}): Promise<FeedPage> {
  return api.get<FeedPage>(
    `${ENDPOINTS.users.feed}${qs({
      type: params.type,
      cursor: params.cursor ?? undefined,
      limit: params.limit,
    })}`,
  );
}
