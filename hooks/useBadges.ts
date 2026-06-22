import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { fetchBadges } from "@/lib/badges/api";
import {
  badgeKey,
  getSeenBadges,
  isSeenStoreUninitialized,
  setSeenBadges,
} from "@/lib/badges/seenStore";
import type { BadgeType } from "@/lib/badges/types";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/AuthProvider";

/** `GET /users/me/badges` — all three families (gallery, screen 103). */
export function useBadges(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.badges.mine(),
    queryFn: fetchBadges,
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}

/** Single family for the detail screen (104) — derived from the same payload. */
export function useBadgeFamily(type: BadgeType) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.badges.mine(),
    queryFn: fetchBadges,
    enabled: isAuthenticated,
    select: (all) => all.find((b) => b.badge_type === type) ?? null,
  });
}

/**
 * Watch `/users/me/badges` (refreshed after journal/check-in writes) for a
 * freshly-earned tier the user hasn't been shown yet, so the hosting screen can
 * route to the Badge Earned celebration (105). Seeds silently on first run.
 */
export function useBadgeCelebration(): {
  pending: { badge_type: BadgeType; tier: number } | null;
  acknowledge: () => void;
} {
  const { data } = useBadges();
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const [pending, setPending] = useState<{ badge_type: BadgeType; tier: number } | null>(null);

  useEffect(() => {
    void getSeenBadges().then((keys) => setSeen(new Set(keys)));
  }, []);

  useEffect(() => {
    if (!data || seen == null) return;
    const earnedKeys = data.flatMap((f) => f.earned.map((e) => badgeKey(f.badge_type, e.tier)));

    // First run: seed the store with whatever is already earned (no celebration).
    void isSeenStoreUninitialized().then((uninit) => {
      if (uninit) {
        void setSeenBadges(earnedKeys);
        setSeen(new Set(earnedKeys));
        return;
      }
      const fresh = data
        .flatMap((f) => f.earned.map((e) => ({ badge_type: f.badge_type, tier: e.tier })))
        .find((b) => !seen.has(badgeKey(b.badge_type, b.tier)));
      if (fresh) setPending(fresh);
    });
  }, [data, seen]);

  const acknowledge = useCallback(() => {
    if (!pending || !data) return;
    const earnedKeys = data.flatMap((f) => f.earned.map((e) => badgeKey(f.badge_type, e.tier)));
    void setSeenBadges(earnedKeys);
    setSeen(new Set(earnedKeys));
    setPending(null);
  }, [pending, data]);

  return { pending, acknowledge };
}
