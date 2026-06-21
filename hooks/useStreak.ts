import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { upsertJournal } from "@/lib/journal/api";
import { dateRange } from "@/lib/journal/dates";
import {
  getLastCelebratedMilestone,
  isMilestoneStoreUninitialized,
  setLastCelebratedMilestone,
} from "@/lib/journal/milestoneStore";
import { fetchStreak, reachedMilestone } from "@/lib/journal/streak";
import { setExemptRange, type ExemptReason } from "@/lib/journal/exemptStore";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/AuthProvider";

/** `GET /users/me/streak` — current/longest + freeze counts. */
export function useStreak(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.streak.mine(),
    queryFn: fetchStreak,
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}

/**
 * Exempt Mode (screen 98). Marks each day in [start, end] as protected on the
 * server (`is_protected: true`) and stores the *reason* device-locally — the
 * server can't distinguish exempt from freeze. Days already finalized may be
 * rejected server-side; the screen restricts the range accordingly.
 */
export function useExemptMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ start, end, reason }: { start: string; end: string; reason: ExemptReason }) => {
      const dates = dateRange(start, end);
      // Independent per-day writes — run them concurrently so a 14-day range is
      // one round-trip's latency instead of fourteen.
      await Promise.all(dates.map((d) => upsertJournal({ entry_date: d, is_protected: true })));
      await setExemptRange(dates, reason);
      return dates;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.streak.mine() });
      void queryClient.invalidateQueries({ queryKey: ["journal", "history"] });
    },
  });
}

/**
 * Watch the live streak for a newly-crossed milestone the user hasn't seen yet
 * (display-only; the server has no milestone endpoint). The hosting screen
 * navigates to the celebration when `pending` is set, then calls `acknowledge`.
 */
export function useMilestoneWatch(): { pending: number | null; acknowledge: () => void } {
  const { data } = useStreak();
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    void getLastCelebratedMilestone().then(setLastSeen);
  }, []);

  useEffect(() => {
    if (!data || lastSeen == null) return;
    const reached = reachedMilestone(data.current);
    if (reached == null || reached <= lastSeen) return;
    // First run (fresh install / cleared data): seed to the current milestone so
    // an existing streak doesn't re-celebrate a milestone the user already saw.
    void isMilestoneStoreUninitialized().then((uninit) => {
      if (uninit) {
        void setLastCelebratedMilestone(reached);
        setLastSeen(reached);
      } else {
        setPending(reached);
      }
    });
  }, [data, lastSeen]);

  const acknowledge = useCallback(() => {
    if (pending == null) return;
    void setLastCelebratedMilestone(pending);
    setLastSeen(pending);
    setPending(null);
  }, [pending]);

  return { pending, acknowledge };
}
