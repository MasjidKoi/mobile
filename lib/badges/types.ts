/**
 * Badges (`GET /users/me/badges`). The backend defines exactly three families,
 * each with three tiers on resonant milestone numbers. The endpoint returns one
 * row per family with the live counter, the highest tier earned, the next
 * threshold, and the earned-tier history. There is no single-badge endpoint —
 * the detail screen selects its family from this same payload.
 */
import type { Feather } from "@expo/vector-icons";

export type BadgeType = "FajrWarrior" | "GenerousGiver" | "CommunityPillar";

export interface EarnedTier {
  tier: number;
  earned_at: string;
}

export interface BadgeFamily {
  badge_type: BadgeType;
  /** Live counter (consecutive Fajr days, giving months, contribution points). */
  current_value: number;
  /** Highest tier earned (0 = none). */
  current_tier: number;
  /** Threshold for the next tier, or null if maxed. */
  next_threshold: number | null;
  earned: EarnedTier[];
}

type FeatherName = keyof typeof Feather.glyphMap;

export interface BadgeMeta {
  icon: FeatherName;
  /** i18n key base under `badges.families.<key>` for name/criteria copy. */
  key: string;
  /** The three tier thresholds, ascending. */
  thresholds: [number, number, number];
}

/** Static per-family presentation + thresholds (mirrors the backend rules). */
export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  FajrWarrior: { icon: "sunrise", key: "fajrWarrior", thresholds: [7, 40, 100] },
  GenerousGiver: { icon: "heart", key: "generousGiver", thresholds: [3, 6, 12] },
  CommunityPillar: { icon: "users", key: "communityPillar", thresholds: [10, 50, 150] },
};

export const BADGE_TIER_COUNT = 3;

/** Order families consistently in the gallery, with any unknown type last. */
export function sortBadgeFamilies(families: BadgeFamily[]): BadgeFamily[] {
  const order: BadgeType[] = ["FajrWarrior", "GenerousGiver", "CommunityPillar"];
  return [...families].sort(
    (a, b) => order.indexOf(a.badge_type) - order.indexOf(b.badge_type),
  );
}
