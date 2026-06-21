/**
 * Centralized React Query key factory. Every hook derives its key from here so
 * invalidation stays consistent and keys remain serializable. Grow per phase.
 */
export const qk = {
  appConfig: () => ["app-config"] as const,
  masjids: {
    all: () => ["masjids"] as const,
    nearby: (params: { lat: number; lng: number; radiusKm?: number }) =>
      ["masjids", "nearby", params] as const,
    search: (query: string) => ["masjids", "search", query] as const,
    detail: (id: string) => ["masjids", "detail", id] as const,
  },
  user: {
    me: () => ["user", "me"] as const,
  },
} as const;
