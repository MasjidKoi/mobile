import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { TokenResponse } from "@/lib/auth/refresh";

/** `POST /auth/otp/request` → always 202; reports the resend cooldown. */
export type OtpRequestResponse = { detail: string; retry_after_seconds: number };

/**
 * Request an emailed OTP. `auth: false` is essential: these endpoints are
 * unauthenticated, and a 401 from verify ("wrong code") must NOT trip the
 * client's refresh-then-degrade path — that's for session expiry, not bad codes.
 */
export function useRequestOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<OtpRequestResponse>(ENDPOINTS.auth.otpRequest, { email }, { auth: false }),
  });
}

/** Verify the emailed code → tokens + `is_new_user`. Errors surface as `ApiError`. */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      api.post<TokenResponse>(ENDPOINTS.auth.otpVerify, { email, code }, { auth: false }),
  });
}
