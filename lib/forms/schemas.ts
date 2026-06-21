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
