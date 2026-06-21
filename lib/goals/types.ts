/**
 * Goals (`/users/me/goals`). Two kinds: a Qur'an-quantity goal (cumulative,
 * date-bounded — progress auto-fed from journal Qur'an entries) and a recurring
 * goal (daily/weekly, checked off explicitly). Progress is computed server-side
 * and returned with every goal; its shape is discriminated by `kind`.
 */
import type { QuranUnit } from "@/lib/journal/types";

export type GoalKind = "quran_quantity" | "recurring";
export type GoalStatus = "active" | "paused" | "abandoned";
export type Recurrence = "daily" | "weekly";
export type GoalTemplateKey = "khatm_ramadan" | "ayat_al_kursi" | "surah_al_kahf";

export interface QuranGoalProgress {
  kind: "quran_quantity";
  current_amount: number;
  target_amount: number;
  remaining: number;
  days_remaining: number;
  daily_pace: number;
  is_complete: boolean;
  percent: number;
}

export interface RecurringGoalProgress {
  kind: "recurring";
  total_completions: number;
  done_this_period: boolean;
  current_streak: number;
  last_completed_on: string | null;
}

export type GoalProgress = QuranGoalProgress | RecurringGoalProgress;

export interface Goal {
  goal_id: string;
  goal_kind: GoalKind;
  template: GoalTemplateKey | null;
  title: string;
  status: GoalStatus;
  target_amount: number | null;
  unit: QuranUnit | null;
  start_date: string | null;
  end_date: string | null;
  recurrence: Recurrence | null;
  created_at: string;
  updated_at: string;
  progress: GoalProgress;
}

export interface GoalListResponse {
  items: Goal[];
  total: number;
}

export type GoalCreate =
  | {
      goal_kind: "quran_quantity";
      title: string;
      target_amount: number;
      unit: QuranUnit;
      start_date: string;
      end_date: string;
    }
  | {
      goal_kind: "recurring";
      title: string;
      recurrence: Recurrence;
    };

export interface GoalTemplateCreate {
  template: GoalTemplateKey;
  start_date?: string;
  end_date?: string;
}

export interface GoalUpdate {
  status?: GoalStatus;
  title?: string;
}

/** Template catalogue for the Goal Templates screen (107). Copy is i18n-keyed
 * under `goals.templates.<key>`; `requiresDateRange` drives the date prompt. */
export const GOAL_TEMPLATES: {
  key: GoalTemplateKey;
  kind: GoalKind;
  requiresDateRange: boolean;
  icon: string;
}[] = [
  { key: "khatm_ramadan", kind: "quran_quantity", requiresDateRange: true, icon: "book-open" },
  { key: "ayat_al_kursi", kind: "recurring", requiresDateRange: false, icon: "shield" },
  { key: "surah_al_kahf", kind: "recurring", requiresDateRange: false, icon: "sun" },
];

/** Type guard for progress kind (narrows the discriminated union in screens). */
export function isQuranProgress(p: GoalProgress): p is QuranGoalProgress {
  return p.kind === "quran_quantity";
}
