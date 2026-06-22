/**
 * GoalsApiClient — cumulative + recurring ibadah goals (Bearer; callers gate
 * writes via `requireAuth`). Hooks in `hooks/` wrap these with React Query.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";

import type {
  Goal,
  GoalCreate,
  GoalListResponse,
  GoalTemplateCreate,
  GoalUpdate,
} from "./types";

/** `GET /users/me/goals` — all goals (optionally filtered by status), each with progress. */
export function fetchGoals(status?: string): Promise<GoalListResponse> {
  return api.get<GoalListResponse>(`${ENDPOINTS.users.goals}${qs({ status })}`);
}

/** `GET /users/me/goals/{id}` — a single goal with computed progress. */
export function fetchGoal(id: string): Promise<Goal> {
  return api.get<Goal>(ENDPOINTS.users.goalById(id));
}

/** `POST /users/me/goals` — create a free-form goal (quran_quantity or recurring). */
export function createGoal(body: GoalCreate): Promise<Goal> {
  return api.post<Goal>(ENDPOINTS.users.goals, body);
}

/** `POST /users/me/goals/templates` — instantiate a preset (Khatm / Ayat al-Kursi / al-Kahf). */
export function createGoalFromTemplate(body: GoalTemplateCreate): Promise<Goal> {
  return api.post<Goal>(ENDPOINTS.users.goalTemplates, body);
}

/** `PATCH /users/me/goals/{id}` — pause / resume / abandon / rename. */
export function updateGoal(id: string, body: GoalUpdate): Promise<Goal> {
  return api.patch<Goal>(ENDPOINTS.users.goalById(id), body);
}

/** `DELETE /users/me/goals/{id}` — remove a goal and its check-offs (204). */
export function deleteGoal(id: string): Promise<null> {
  return api.delete<null>(ENDPOINTS.users.goalById(id));
}

/** `POST /users/me/goals/{id}/completions` — check off a recurring goal (idempotent). */
export function addGoalCompletion(id: string, completion_date?: string): Promise<Goal> {
  return api.post<Goal>(ENDPOINTS.users.goalCompletions(id), { completion_date });
}

/** `DELETE /users/me/goals/{id}/completions/{date}` — un-check a recurring completion. */
export function removeGoalCompletion(id: string, date: string): Promise<Goal> {
  return api.delete<Goal>(ENDPOINTS.users.goalCompletionByDate(id, date));
}
