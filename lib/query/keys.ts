import type { Coords } from "@/lib/location/types";
import type { MasjidFacilityFilters } from "@/lib/masjids/types";

/**
 * Centralized React Query key factory. Every hook derives its key from here so
 * invalidation stays consistent and keys remain serializable. Grow per phase.
 *
 * The first tuple element is the persistence root: `lib/query/persister.ts`
 * writes only `["masjids", …]` and `["app-config"]` queries to disk.
 */
export const qk = {
  appConfig: () => ["app-config"] as const,
  masjids: {
    all: () => ["masjids"] as const,
    nearby: (params: {
      lat: number;
      lng: number;
      radius_m?: number;
      filters?: MasjidFacilityFilters;
    }) => ["masjids", "nearby", params] as const,
    search: (query: string, coords?: Coords | null) =>
      ["masjids", "search", query, coords ?? null] as const,
    detail: (id: string) => ["masjids", "detail", id] as const,
    prayerTimes: (id: string, params?: { date?: string; days?: number }) =>
      ["masjids", "prayer-times", id, params ?? {}] as const,
    jumah: (id: string) => ["masjids", "jumah", id] as const,
    // Phase 5 profile reads — kept under the "masjids" root so a viewed profile
    // (campaigns/Q&A/reviews/visitor photos) survives offline alongside detail.
    campaigns: (id: string) => ["masjids", "campaigns", id] as const,
    answeredQuestions: (id: string) => ["masjids", "questions", id] as const,
    reviewsSummary: (id: string) => ["masjids", "reviews-summary", id] as const,
    communityPhotos: (id: string) => ["masjids", "community-photos", id] as const,
  },
  user: {
    me: () => ["user", "me"] as const,
  },
  submissions: {
    // User-specific → deliberately outside the "masjids" persistence root.
    mine: () => ["submissions", "mine"] as const,
  },
  // User-specific contribution lists — outside the persistence root.
  photoSubmissions: {
    mine: () => ["photo-submissions", "mine"] as const,
  },
  questions: {
    mine: () => ["questions", "mine"] as const,
  },
  // Session-optimistic follow state (no read endpoint until Phase 8).
  follows: {
    status: (id: string) => ["follows", id] as const,
  },
} as const;
