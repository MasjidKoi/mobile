/**
 * Backend routes mount at ROOT — there is **no `/api/v1` prefix**. Paths here
 * are relative to `env.apiBaseUrl`. Add new domains as the feature phases land.
 */
export const ENDPOINTS = {
  auth: {
    otpRequest: "/auth/otp/request",
    otpVerify: "/auth/otp/verify",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  appConfig: "/app-config",
  users: {
    me: "/users/me",
    devices: "/users/me/devices",
    // Phase 7 — settings. `me` doubles as the DELETE target (202 soft-delete).
    export: "/users/me/export",
    notificationPreferences: "/users/me/notification-preferences",
    // Phase 8 — community. Followed-masjid feed (type-segmented) + check-in history.
    feed: "/users/me/feed",
    checkins: "/users/me/checkins",
  },
  masjids: {
    nearby: "/masjids/nearby",
    search: "/masjids/search",
    byId: (id: string) => `/masjids/${id}`,
    prayerTimes: (id: string) => `/masjids/${id}/prayer-times`,
    jumah: (id: string) => `/masjids/${id}/jumah`,
    submissions: "/masjids/submissions",
    submissionPhoto: "/masjids/submissions/photo",
    // Phase 5 — profile extras + contribution channels
    campaigns: (id: string) => `/masjids/${id}/campaigns`,
    questions: (id: string) => `/masjids/${id}/questions`,
    reviews: (id: string) => `/masjids/${id}/reviews`,
    communityPhotos: (id: string) => `/masjids/${id}/community-photos`,
    report: (id: string) => `/masjids/${id}/report`,
    reviewById: (id: string, reviewId: string) => `/masjids/${id}/reviews/${reviewId}`,
    follow: (id: string) => `/masjids/${id}/follow`,
    followersCount: (id: string) => `/masjids/${id}/followers/count`,
    // Phase 6 — start a donation against a masjid (Bearer; SSLCommerz checkout).
    donations: (id: string) => `/masjids/${id}/donations`,
    // Phase 8 — community. Announcements + events (public reads), RSVP toggle,
    // and the geofenced check-in (Bearer).
    announcements: (id: string) => `/masjids/${id}/announcements`,
    announcementById: (id: string, announcementId: string) =>
      `/masjids/${id}/announcements/${announcementId}`,
    events: (id: string) => `/masjids/${id}/events`,
    eventRsvp: (id: string, eventId: string) => `/masjids/${id}/events/${eventId}/rsvp`,
    checkin: (id: string) => `/masjids/${id}/checkin`,
  },
  // Phase 6 — campaign-scoped donations + single-donation reads.
  campaigns: {
    donations: (id: string) => `/campaigns/${id}/donations`,
  },
  donations: {
    byId: (id: string) => `/donations/${id}`,
    receipt: (id: string) => `/donations/${id}/receipt`,
  },
  me: {
    submissions: "/me/submissions",
    photoSubmissions: "/me/photo-submissions",
    questions: "/me/questions",
    // Phase 6 — donation history, summary, annual report, recurring reminders.
    donations: "/me/donations",
    donationsSummary: "/me/donations/summary",
    annualReport: "/me/donations/annual-report",
    recurring: "/me/recurring-schedules",
    recurringById: (id: string) => `/me/recurring-schedules/${id}`,
  },
} as const;
