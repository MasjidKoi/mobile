import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { Query } from "@tanstack/react-query";

import { env } from "@/config/env";

/**
 * How long a persisted cache entry survives before it's dropped on hydration.
 * 7 days so the week of prayer times that `usePrayerTimes` pulls (and pins/
 * config) stay available offline; entries are still revalidated when online.
 */
export const PERSIST_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Cache version. Bumps invalidate everything on next launch; keying on `appEnv`
 * also keeps dev/staging/prod caches from bleeding into each other.
 */
export const PERSIST_BUSTER = `v1-${env.appEnv}`;

/**
 * AsyncStorage-backed persister. JS-only — no native module — which is why we
 * use it over MMKV (react-native-mmkv isn't installed). Writes are throttled so
 * a burst of query updates collapses into one storage write.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "masjidkoi.rq-cache.v1",
  throttleTime: 1000,
});

/**
 * Whitelist of what reaches disk: successful, public, non-PII masjid and
 * app-config reads — so pins, prayer-times and config hydrate offline — plus the
 * followed-masjid `feed` (announcements/events of masjids the user chose to
 * follow) so the Feed-Offline variant works on a cold start. The feed is
 * user-scoped, so `AuthProvider` drops it from the cache on logout/session-expiry
 * to avoid it bleeding across accounts. Other user/auth/profile queries are never
 * persisted. (The first key tuple element is the persistence root; see
 * `lib/query/keys.ts`.)
 */
export function shouldDehydrateQuery(query: Query): boolean {
  if (query.state.status !== "success") return false;
  const root = query.queryKey[0];
  return root === "masjids" || root === "app-config" || root === "feed";
}
