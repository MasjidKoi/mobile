import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

/**
 * App-wide React Query client.
 *
 * - `staleTime` 60s keeps lists/detail snappy without hammering the backend.
 * - 4xx (auth/validation) never retry; transient 5xx / network errors retry once.
 * - `refetchOnWindowFocus` is off — that web concept is noisy on mobile.
 *
 * Offline/MMKV persistence is layered on in Phase 2 (shared data layer).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}
