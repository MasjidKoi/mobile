/**
 * BadgesApiClient — the badge gallery (Bearer). A single GET returns all three
 * families; the gallery and detail screens render from this one payload.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { BadgeFamily } from "./types";

/** `GET /users/me/badges` — all badge families with earned tiers + progress. */
export function fetchBadges(): Promise<BadgeFamily[]> {
  return api.get<BadgeFamily[]>(ENDPOINTS.users.badges);
}
