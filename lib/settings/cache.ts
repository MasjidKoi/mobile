import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Storage & offline inspector (PRD 09 #30–33). Reports what the React Query
 * offline cache holds, grouped into the user-facing categories, and clears it
 * on request WITHOUT touching settings or auth state.
 *
 * Only the public, persisted reads (`masjids` + `app-config`, per
 * lib/query/persister.ts) are inspectable/clearable; user/auth/donations
 * queries are never persisted and never cleared here.
 */

// AsyncStorage keys this module is allowed to drop on a clear. The persisted RQ
// blob (lib/query/persister.ts) and the recents list — NOT theme/font/language/
// numerals/reminder/guest/token keys, which must survive a cache clear.
const PERSIST_CACHE_KEY = "masjidkoi.rq-cache.v1";
const RECENTS_KEY = "masjidkoi.recents.v1";

const storage = (): {
  removeItem(k: string): Promise<void>;
} => require("@react-native-async-storage/async-storage").default;

export type CacheCategoryKey = "prayer" | "masjids" | "feed" | "tiles";

export interface CacheCategory {
  key: CacheCategoryKey;
  labelKey: string;
  icon: string;
  bytes: number;
  /** Most-recent `dataUpdatedAt` across the category's queries, or null. */
  lastSync: number | null;
}

export interface CacheSummary {
  totalBytes: number;
  categories: CacheCategory[];
}

/** Whether a query may be dropped by "Clear cached data" (public/device cache —
 * never settings, auth, or user-scoped private data). `recents` is the in-memory
 * mirror of the recents list whose AsyncStorage key is also dropped below. */
export function isClearableQuery(queryKey: QueryKey): boolean {
  const root = queryKey[0];
  return (
    root === "masjids" ||
    root === "app-config" ||
    root === "recents" ||
    root === "feed"
  );
}

/** Which display category a persisted query belongs to (null = not inspected). */
function categoryFor(queryKey: QueryKey): CacheCategoryKey | null {
  const [root, sub] = queryKey as [unknown, unknown];
  if (root === "app-config") return "masjids";
  if (root === "feed") return "feed";
  if (root !== "masjids") return null;
  if (sub === "prayer-times" || sub === "jumah") return "prayer";
  return "masjids";
}

const CATEGORY_META: {
  key: CacheCategoryKey;
  labelKey: string;
  icon: string;
}[] = [
  { key: "prayer", labelKey: "settings.storage.cachePrayer", icon: "clock" },
  {
    key: "masjids",
    labelKey: "settings.storage.cacheMasjids",
    icon: "map-pin",
  },
  { key: "feed", labelKey: "settings.storage.cacheFeed", icon: "rss" },
  { key: "tiles", labelKey: "settings.storage.cacheTiles", icon: "map" },
];

/** Rough byte size of a cached value (UTF-16 length of its JSON). */
function sizeOf(data: unknown): number {
  if (data == null) return 0;
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}

export function getCacheSummary(queryClient: QueryClient): CacheSummary {
  const acc: Record<
    CacheCategoryKey,
    { bytes: number; lastSync: number | null }
  > = {
    prayer: { bytes: 0, lastSync: null },
    masjids: { bytes: 0, lastSync: null },
    feed: { bytes: 0, lastSync: null },
    tiles: { bytes: 0, lastSync: null },
  };

  for (const query of queryClient.getQueryCache().getAll()) {
    if (query.state.status !== "success") continue;
    const cat = categoryFor(query.queryKey);
    if (!cat) continue;
    acc[cat].bytes += sizeOf(query.state.data);
    const updated = query.state.dataUpdatedAt || null;
    if (updated && (acc[cat].lastSync == null || updated > acc[cat].lastSync)) {
      acc[cat].lastSync = updated;
    }
  }

  const categories = CATEGORY_META.map((m) => ({ ...m, ...acc[m.key] }));
  const totalBytes = categories.reduce((sum, c) => sum + c.bytes, 0);
  return { totalBytes, categories };
}

/** A byte count as a value + unit (the screen formats the value via useFormat). */
export function bytesToDisplay(bytes: number): {
  value: number;
  unit: "KB" | "MB";
} {
  if (bytes >= 1024 * 1024) {
    return { value: Math.round((bytes / (1024 * 1024)) * 10) / 10, unit: "MB" };
  }
  return { value: Math.max(0, Math.round(bytes / 1024)), unit: "KB" };
}

/**
 * Drop every clearable cached query + the persisted blob and recents list.
 * Settings, auth tokens, reminder prefs, and guest data live under other keys
 * and are deliberately untouched (PRD 09 #32).
 */
export async function clearCache(queryClient: QueryClient): Promise<void> {
  queryClient.removeQueries({ predicate: (q) => isClearableQuery(q.queryKey) });
  try {
    await storage().removeItem(PERSIST_CACHE_KEY);
    await storage().removeItem(RECENTS_KEY);
  } catch {
    // Non-fatal — the in-memory cache is already cleared.
  }
}
