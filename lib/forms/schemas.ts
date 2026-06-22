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
