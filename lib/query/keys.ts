import type { DonationHistoryFilters } from "@/lib/donations/types";
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
    // Phase 8 — community reads kept under the "masjids" persistence root so a
    // viewed profile's announcements/events/reviews survive offline.
    announcements: (id: string) => ["masjids", "announcements", id] as const,
    announcement: (id: string, announcementId: string) =>
      ["masjids", "announcement", id, announcementId] as const,
    events: (id: string) => ["masjids", "events", id] as const,
    reviews: (id: string) => ["masjids", "reviews", id] as const,
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
  // Phase 7 — server notification preferences (digest hour, mute toggles,
  // donate-anonymously default, and the followed-masjid list with per-masjid mode).
  // Phase 8 makes this the single source of truth for "am I following?" — the
  // follow toggle reads/optimistically patches `.masjids[]` here.
  notificationPrefs: () => ["notification-preferences"] as const,
  // Phase 8 — followed-masjid feed (type-segmented; user-scoped). Persisted so the
  // Feed-Offline variant + Storage feed-cache row work; dropped on logout.
  feed: {
    list: (type: "announcements" | "events") => ["feed", type] as const,
  },
  // Phase 8 — check-in history (user-scoped, not persisted).
  checkins: {
    mine: () => ["checkins", "mine"] as const,
  },
  // Phase 6 — donations + recurring. User-scoped private data, deliberately
  // OUTSIDE the "masjids"/"app-config" persistence root (never cached to disk).
  donations: {
    detail: (id: string) => ["donations", "detail", id] as const,
    mine: (filters?: DonationHistoryFilters) =>
      ["donations", "mine", filters ?? {}] as const,
    summary: () => ["donations", "summary"] as const,
  },
  recurring: {
    mine: () => ["recurring", "mine"] as const,
  },
  // Phase 9 — gamification. All user-scoped private data, deliberately OUTSIDE
  // the "masjids"/"app-config" persistence root (never cached to disk; dropped
  // on logout — same treatment as donations/checkins).
  journal: {
    entry: (date: string) => ["journal", "entry", date] as const,
    history: (filters?: { date_from?: string; date_to?: string }) =>
      ["journal", "history", filters ?? {}] as const,
  },
  streak: {
    mine: () => ["streak", "mine"] as const,
  },
  badges: {
    mine: () => ["badges", "mine"] as const,
  },
  goals: {
    mine: (status?: string) => ["goals", "mine", status ?? "all"] as const,
    detail: (id: string) => ["goals", "detail", id] as const,
  },
} as const;
