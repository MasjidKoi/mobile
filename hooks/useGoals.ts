import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addGoalCompletion,
  createGoal,
  createGoalFromTemplate,
  deleteGoal,
  fetchGoal,
  fetchGoals,
  removeGoalCompletion,
  updateGoal,
} from "@/lib/goals/api";
import type { Goal, GoalCreate, GoalTemplateCreate, GoalUpdate } from "@/lib/goals/types";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/providers/AuthProvider";

/** `GET /users/me/goals` — list (optionally by status), each with progress. */
export function useGoals(status?: string, options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.goals.mine(status),
    queryFn: () => fetchGoals(status),
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}

/** `GET /users/me/goals/{id}` — single goal with progress (detail, screen 108). */
export function useGoal(id: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.goals.detail(id),
    queryFn: () => fetchGoal(id),
    enabled: isAuthenticated && !!id,
  });
}

function invalidateGoalLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["goals", "mine"] });
}

/** Create a free-form goal (109). */
export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GoalCreate) => createGoal(body),
    onSuccess: () => invalidateGoalLists(queryClient),
  });
}

/** Instantiate a preset (107). */
export function useCreateGoalFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GoalTemplateCreate) => createGoalFromTemplate(body),
    onSuccess: () => invalidateGoalLists(queryClient),
  });
}

/** Pause / resume / abandon / rename (108). */
export function useUpdateGoal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GoalUpdate) => updateGoal(id, body),
    onSuccess: (goal: Goal) => {
      queryClient.setQueryData(qk.goals.detail(id), goal);
      invalidateGoalLists(queryClient);
    },
  });
}

/** Delete a goal (108). */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: (_res, id) => {
      queryClient.removeQueries({ queryKey: qk.goals.detail(id) });
      invalidateGoalLists(queryClient);
    },
  });
}

/**
 * Toggle a recurring goal's check-off for a date. `done` is the *current* state:
 * already done → remove, otherwise → add (idempotent server-side).
 */
export function useToggleGoalCompletion(goalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ done, date }: { done: boolean; date: string }) =>
      done ? removeGoalCompletion(goalId, date) : addGoalCompletion(goalId, date),
    onSuccess: (goal: Goal) => {
      queryClient.setQueryData(qk.goals.detail(goalId), goal);
      invalidateGoalLists(queryClient);
    },
  });
}
