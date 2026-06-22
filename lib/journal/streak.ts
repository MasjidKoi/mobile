/**
 * Streak (`GET /users/me/streak`). Journal-derived: a day extends the streak
 * only when all five prayers are logged. Freezes are earned automatically (one
 * per 30 complete days, max 2 held) and auto-applied to cover an incomplete
 * finalized day — they are server-derived, never user-managed. A protected day
 * (`is_protected`) passes through without consuming a freeze.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface StreakResponse {
  current: number;
  longest: number;
  freezes_held: number;
  freezes_applied: number;
}

/** Streak milestones that trigger a celebration (display-only). */
export const STREAK_MILESTONES = [7, 40, 100, 200, 365] as const;

/** Highest milestone reached at-or-below `current`, or null if none. */
export function reachedMilestone(current: number): number | null {
  let hit: number | null = null;
  for (const m of STREAK_MILESTONES) {
    if (current >= m) hit = m;
  }
  return hit;
}

export function fetchStreak(): Promise<StreakResponse> {
  return api.get<StreakResponse>(ENDPOINTS.users.streak);
}
