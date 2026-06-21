/**
 * Backend routes mount at ROOT — there is **no `/api/v1` prefix**. Paths here
 * are relative to `env.apiBaseUrl`. Add new domains as the feature phases land.
 */
export const ENDPOINTS = {
  auth: {
    otpRequest: "/auth/otp/request",
    otpVerify: "/auth/otp/verify",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  appConfig: "/app-config",
  users: {
    me: "/users/me",
    devices: "/users/me/devices",
  },
  masjids: {
    nearby: "/masjids/nearby",
    search: "/masjids/search",
    byId: (id: string) => `/masjids/${id}`,
  },
} as const;
