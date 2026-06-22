/**
 * Check-in (`POST /masjids/{id}/checkin`). The server enforces a 100m geofence
 * (400 when too far) and returns any newly-crossed gamification badges. Phase 8
 * surfaces the badges minimally; the full journal/gallery is Phase 9.
 */

export type BadgeType = "FajrWarrior" | "GenerousGiver" | "CommunityPillar";

export interface CheckInBadge {
  badge_id: string;
  badge_type: BadgeType;
  tier: number;
  earned_at: string;
}

export interface CheckInResponse {
  checkin_id: string;
  masjid_id: string | null;
  checked_in_at: string;
  new_badges: CheckInBadge[];
}

export interface CheckInHistoryItem {
  checkin_id: string;
  masjid_id: string | null;
  masjid_name: string | null;
  checked_in_at: string;
}

export interface CheckInHistoryResponse {
  items: CheckInHistoryItem[];
  total_checkins: number;
  page: number;
  page_size: number;
}
