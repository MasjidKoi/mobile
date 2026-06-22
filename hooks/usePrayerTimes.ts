import { useQuery } from "@tanstack/react-query";

import { fetchPrayerTimes } from "@/lib/masjids/api";
import { qk } from "@/lib/query/keys";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `GET /masjids/{id}/prayer-times`. Defaults to a 7-day pull so the offline
 * cache holds a week of times. Times are stable for the day, so `staleTime` is
 * long and `gcTime` spans the week to survive backgrounding.
 */
export function usePrayerTimes(
  id: string | null | undefined,
  params?: { date?: string; days?: number },
) {
  const days = params?.days ?? 7;
  const date = params?.date;
  return useQuery({
    queryKey: qk.masjids.prayerTimes(id ?? "", { date, days }),
    queryFn: () => fetchPrayerTimes(id as string, { date, days }),
    enabled: !!id,
    staleTime: DAY_MS,
    gcTime: 7 * DAY_MS,
  });
}
