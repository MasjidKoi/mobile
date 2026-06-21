import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

/**
 * App-wide React Query client.
 *
 * - `staleTime` 60s keeps lists/detail snappy without hammering the backend.
 * - 4xx (auth/validation) never retry; transient 5xx / network errors retry once.
 * - `refetchOnWindowFocus` is off — that web concept is noisy on mobile.
 *
 * Offline persistence (AsyncStorage) wraps this client in
 * `providers/AppProviders.tsx` via `lib/query/persister.ts` (Phase 2). Only
 * public masjid/app-config reads are written to disk — never user/auth data.
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
