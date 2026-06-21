import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

/** Per-follow announcement mode (backend `NotificationMode`). */
export type NotificationMode = "digest" | "instant" | "mute";

export interface FollowedMasjidPreference {
  masjid_id: string;
  name: string;
  notification_mode: NotificationMode;
}

/** `GET /users/me/notification-preferences` response. */
export interface NotificationPreferences {
  digest_hour: number;
  donate_anonymously_by_default: boolean;
  mute_donation_nudge: boolean;
  mute_campaign_milestone: boolean;
  mute_moderation_outcome: boolean;
  mute_photo_outcome: boolean;
  mute_promotions: boolean;
  masjids: FollowedMasjidPreference[];
}

/** Partial update — only sent fields are persisted (`exclude_unset` server-side). */
export type NotificationPreferencesUpdate = Partial<
  Pick<
    NotificationPreferences,
    | "digest_hour"
    | "donate_anonymously_by_default"
    | "mute_donation_nudge"
    | "mute_campaign_milestone"
    | "mute_moderation_outcome"
    | "mute_photo_outcome"
    | "mute_promotions"
  >
>;

export function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return api.get<NotificationPreferences>(ENDPOINTS.users.notificationPreferences);
}

export function updateNotificationPreferences(
  patch: NotificationPreferencesUpdate,
): Promise<NotificationPreferences> {
  return api.patch<NotificationPreferences>(ENDPOINTS.users.notificationPreferences, patch);
}

/** `PATCH /masjids/{id}/follow` — set the per-masjid notification mode (204). */
export function setFollowNotificationMode(
  masjidId: string,
  mode: NotificationMode,
): Promise<void> {
  return api.patch<void>(ENDPOINTS.masjids.follow(masjidId), { notification_mode: mode });
}
