import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { fetchJournal, upsertJournal } from "@/lib/journal/api";
import { dhakaToday } from "@/lib/journal/dates";
import type { JournalEntry, JournalListResponse, Prayers, QuranLog } from "@/lib/journal/types";
import { qk } from "@/lib/query/keys";
import { parseReflection, mergeReflection } from "@/lib/reflection/compute";
import { useAuth } from "@/providers/AuthProvider";

const EMPTY_PRAYERS: Prayers = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

/** A synthetic empty entry so screens always have a `prayers` object to render. */
export function emptyJournalEntry(date: string): JournalEntry {
  return {
    journal_id: "",
    entry_date: date,
    prayers: { ...EMPTY_PRAYERS },
    quran: null,
    is_protected: false,
    notes: null,
    created_at: "",
    updated_at: "",
  };
}

/** A single day's entry. The backend has no single-GET, so we read the
 * one-day-window list and fall back to an empty entry. */
export function useJournalEntry(date: string = dhakaToday()) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.journal.entry(date),
    queryFn: async () => {
      const res = await fetchJournal({ date_from: date, date_to: date, page_size: 1 });
      return res.items[0] ?? emptyJournalEntry(date);
    },
    enabled: isAuthenticated,
  });
}

/** A bounded range of entries (e.g. a Sat→Fri week for the reflection). */
export function useJournalRange(from: string, to: string, options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.journal.history({ date_from: from, date_to: to }),
    queryFn: () => fetchJournal({ date_from: from, date_to: to, page_size: 50 }),
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}

/** Paginated history (screen 101). */
export function useJournalHistory(filters?: { date_from?: string; date_to?: string }) {
  const { isAuthenticated } = useAuth();
  return useInfiniteQuery({
    queryKey: qk.journal.history(filters),
    queryFn: ({ pageParam }) => fetchJournal({ page: pageParam, page_size: 20, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (last: JournalListResponse) =>
      last.page * last.page_size < last.total ? last.page + 1 : undefined,
    enabled: isAuthenticated,
  });
}

/** Invalidate everything a journal write can affect (streak, badges, history). */
function invalidateDerived(queryClient: ReturnType<typeof useQueryClient>, date: string) {
  void queryClient.invalidateQueries({ queryKey: qk.journal.entry(date) });
  void queryClient.invalidateQueries({ queryKey: ["journal", "history"] });
  void queryClient.invalidateQueries({ queryKey: qk.streak.mine() });
  void queryClient.invalidateQueries({ queryKey: qk.badges.mine() });
  void queryClient.invalidateQueries({ queryKey: ["goals", "mine"] });
}

/**
 * Toggle one or more prayers for a date (optimistic). Used by both the log and
 * un-log paths (`{ fajr: true }` / `{ fajr: false }`). Callers wrap the trigger
 * in `requireAuth` where the screen isn't already auth-only.
 */
export function useLogPrayers(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prayers: Partial<Prayers>) => upsertJournal({ entry_date: date, prayers }),
    onMutate: async (prayers) => {
      await queryClient.cancelQueries({ queryKey: qk.journal.entry(date) });
      const prev = queryClient.getQueryData<JournalEntry>(qk.journal.entry(date));
      const base = prev ?? emptyJournalEntry(date);
      queryClient.setQueryData<JournalEntry>(qk.journal.entry(date), {
        ...base,
        prayers: { ...base.prayers, ...prayers },
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk.journal.entry(date), ctx.prev);
    },
    onSuccess: (entry) => queryClient.setQueryData(qk.journal.entry(date), entry),
    onSettled: () => invalidateDerived(queryClient, date),
  });
}

/** Set or clear the Qur'an log for a date (optimistic, with rollback on error). */
export function useLogQuran(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quran: QuranLog | null) => upsertJournal({ entry_date: date, quran }),
    onMutate: async (quran) => {
      await queryClient.cancelQueries({ queryKey: qk.journal.entry(date) });
      const prev = queryClient.getQueryData<JournalEntry>(qk.journal.entry(date));
      const base = prev ?? emptyJournalEntry(date);
      queryClient.setQueryData<JournalEntry>(qk.journal.entry(date), { ...base, quran });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk.journal.entry(date), ctx.prev);
    },
    onSuccess: (entry) => queryClient.setQueryData(qk.journal.entry(date), entry),
    onSettled: () => invalidateDerived(queryClient, date),
  });
}

/** Save a day's personal note, preserving any embedded weekly-reflection block. */
export function useSaveJournalNote(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dailyNote: string) => {
      const current = queryClient.getQueryData<JournalEntry>(qk.journal.entry(date));
      const reflection = parseReflection(current?.notes);
      const notes = reflection ? mergeReflection(dailyNote, reflection) : dailyNote;
      return upsertJournal({ entry_date: date, notes });
    },
    onSuccess: (entry) => queryClient.setQueryData(qk.journal.entry(date), entry),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.journal.entry(date) });
      void queryClient.invalidateQueries({ queryKey: ["journal", "history"] });
    },
  });
}
