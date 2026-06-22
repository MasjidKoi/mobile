import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/** Re-exported so screens import RHF + validation wiring from one place. */
export { zodResolver };

/** Error strings are i18n keys (resolved with `t()` at render time). */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "validation.email_required")
  .email("validation.email_invalid");

export const OTP_LENGTH = 6;

export const otpCodeSchema = z
  .string()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), "validation.otp_invalid");

/** Step 1 — request an OTP for an email. */
export const otpRequestSchema = z.object({ email: emailSchema });
export type OtpRequestValues = z.infer<typeof otpRequestSchema>;

/** Step 2 — verify the emailed code. */
export const otpVerifySchema = z.object({ email: emailSchema, code: otpCodeSchema });
export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;

/** Madhab options — values match the backend enum (`PATCH /users/me`). */
export const MADHABS = ["hanafi", "shafi", "maliki", "hanbali"] as const;
export type Madhab = (typeof MADHABS)[number];

/**
 * Profile setup (shown once after first login). Everything is optional — the
 * whole step is skippable. `display_name` empty-string is allowed so the
 * controlled input can clear back to "no name".
 */
export const profileSetupSchema = z.object({
  display_name: z.string().trim().max(100, "validation.name_too_long").optional(),
  madhab: z.enum(MADHABS).optional(),
});
export type ProfileSetupValues = z.infer<typeof profileSetupSchema>;

/**
 * Submit-a-masjid form (17 Submit Masjid). Name is required (backend min 2);
 * coordinates come from the draggable map pin (validated in the screen, not
 * here); address is optional.
 */
export const masjidSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.masjid_name_required")
    .max(200, "validation.masjid_name_too_long"),
  address: z.string().trim().max(500, "validation.address_too_long").optional(),
});
export type MasjidSubmissionFormValues = z.infer<typeof masjidSubmissionSchema>;

/**
 * Donation amount (35/36). The backend enforces 10–500,000 BDT; we mirror it for
 * inline validation before the SSLCommerz hand-off.
 */
export const DONATION_MIN = 10;
export const DONATION_MAX = 500_000;

export const donationAmountSchema = z.object({
  amount: z
    .number({ message: "validation.amount_required" })
    .int("validation.amount_required")
    .min(DONATION_MIN, "validation.amount_too_low")
    .max(DONATION_MAX, "validation.amount_too_high"),
});
export type DonationAmountValues = z.infer<typeof donationAmountSchema>;

/** Name collection (37) — only required when the gift is NOT anonymous. */
export const donorNameSchema = z.object({
  donor_name: z
    .string()
    .trim()
    .min(1, "validation.donor_name_required")
    .max(255, "validation.donor_name_too_long"),
});
export type DonorNameValues = z.infer<typeof donorNameSchema>;

/**
 * Create Custom Goal (109). A flat schema with conditional refinement so a
 * single controlled form can switch between a Qur'an-quantity goal (target +
 * unit + date range) and a recurring goal (daily/weekly). Mirrors the backend's
 * per-kind validation. Error strings are i18n keys.
 */
export const GOAL_TARGET_MIN = 1;
export const GOAL_TARGET_MAX = 10_000;

export const customGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "validation.goal_title_required")
      .max(120, "validation.goal_title_too_long"),
    goal_kind: z.enum(["quran_quantity", "recurring"]),
    target_amount: z
      .number()
      .int("validation.goal_target_required")
      .min(GOAL_TARGET_MIN, "validation.goal_target_required")
      .max(GOAL_TARGET_MAX, "validation.goal_target_too_high")
      .optional(),
    unit: z.enum(["pages", "juz", "minutes"]).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    recurrence: z.enum(["daily", "weekly"]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.goal_kind === "quran_quantity") {
      if (v.target_amount == null)
        ctx.addIssue({ code: "custom", path: ["target_amount"], message: "validation.goal_target_required" });
      if (!v.unit)
        ctx.addIssue({ code: "custom", path: ["unit"], message: "validation.goal_unit_required" });
      if (!v.start_date)
        ctx.addIssue({ code: "custom", path: ["start_date"], message: "validation.start_date_required" });
      if (!v.end_date)
        ctx.addIssue({ code: "custom", path: ["end_date"], message: "validation.end_date_required" });
      if (v.start_date && v.end_date && v.end_date < v.start_date)
        ctx.addIssue({ code: "custom", path: ["end_date"], message: "validation.goal_end_before_start" });
    } else if (!v.recurrence) {
      ctx.addIssue({ code: "custom", path: ["recurrence"], message: "validation.goal_recurrence_required" });
    }
  });
export type CustomGoalValues = z.infer<typeof customGoalSchema>;

/** Date range for a date-bound template (e.g. Khatm in Ramadan, screen 107). */
export const goalDateRangeSchema = z
  .object({
    start_date: z.string().min(1, "validation.start_date_required"),
    end_date: z.string().min(1, "validation.end_date_required"),
  })
  .refine((v) => v.end_date >= v.start_date, {
    path: ["end_date"],
    message: "validation.goal_end_before_start",
  });
export type GoalDateRangeValues = z.infer<typeof goalDateRangeSchema>;
