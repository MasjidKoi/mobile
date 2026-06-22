import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelRecurringSchedule,
  createRecurringSchedule,
  fetchRecurringSchedules,
  updateRecurringSchedule,
} from "@/lib/donations/api";
import type { RecurringScheduleCreate, RecurringScheduleUpdate } from "@/lib/donations/types";
import { qk } from "@/lib/query/keys";

/** `GET /me/recurring-schedules` — the user's reminder schedules (manager). */
export function useRecurringSchedules() {
  return useQuery({
    queryKey: qk.recurring.mine(),
    queryFn: () => fetchRecurringSchedules(),
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecurringScheduleCreate) => createRecurringSchedule(body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.recurring.mine() }),
  });
}

/** Pause / resume / change amount — `PATCH /me/recurring-schedules/{id}`. */
export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: RecurringScheduleUpdate }) =>
      updateRecurringSchedule(vars.id, vars.body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.recurring.mine() }),
  });
}

export function useCancelRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelRecurringSchedule(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: qk.recurring.mine() }),
  });
}
