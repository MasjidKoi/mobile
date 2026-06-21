import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { upsertJournal } from "@/lib/journal/api";
import { currentWeek } from "@/lib/journal/dates";
import { qk } from "@/lib/query/keys";
import {
  computeWeeklyStats,
  hasReflectionContent,
  mergeReflection,
  parseReflection,
  stripReflectionBlock,
  type ReflectionText,
} from "@/lib/reflection/compute";

import { useJournalRange } from "./useJournal";

const EMPTY_REFLECTION: ReflectionText = { insights: "", gratitude: "", nextWeek: "" };

/**
 * Weekly reflection (screen 110). Stats are computed from the current Sat→Fri
 * week's journal entries; the free-text reflection lives in the week-end
 * (Friday) entry's `notes` (no backend endpoint). Saving rewrites just that
 * embedded block, preserving any daily note on that day.
 */
export function useWeeklyReflection() {
  const queryClient = useQueryClient();
  // Recomputed each render (cheap) so the week stays current if the screen is
  // mounted across the Dhaka week boundary; useJournalRange keys on the stable
  // start/end strings, so this doesn't churn the query.
  const week = currentWeek();
  const range = useJournalRange(week.start, week.end);

  const entries = useMemo(() => range.data?.items ?? [], [range.data]);
  const stats = useMemo(
    () => computeWeeklyStats(entries, week),
    [entries, week.start, week.end],
  );

  const endEntry = entries.find((e) => e.entry_date === week.end) ?? null;
  const reflection = parseReflection(endEntry?.notes) ?? EMPTY_REFLECTION;

  const save = useMutation({
    mutationFn: (r: ReflectionText) => {
      // An emptied-out reflection should remove the embedded block, not persist
      // an empty `⟦weekly-reflection⟧{}` placeholder in the day's note.
      const base = endEntry?.notes ?? null;
      const notes = hasReflectionContent(r) ? mergeReflection(base, r) : stripReflectionBlock(base);
      return upsertJournal({ entry_date: week.end, notes });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: qk.journal.history({ date_from: week.start, date_to: week.end }),
      });
      void queryClient.invalidateQueries({ queryKey: qk.journal.entry(week.end) });
    },
  });

  return { week, stats, reflection, isLoading: range.isLoading, save };
}
