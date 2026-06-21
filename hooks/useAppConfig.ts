import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AppConfigResponse } from "@/lib/prayer/types";
import { qk } from "@/lib/query/keys";

const HOUR_MS = 60 * 60 * 1000;

/**
 * `GET /app-config` — Hijri offset, default calc method/madhab, maintenance
 * flag. Public and rarely changes, so it's cached aggressively (and persisted
 * offline alongside masjid reads).
 */
export function useAppConfig() {
  return useQuery({
    queryKey: qk.appConfig(),
    queryFn: () => api.get<AppConfigResponse>(ENDPOINTS.appConfig, { auth: false }),
    staleTime: HOUR_MS,
    gcTime: 24 * HOUR_MS,
  });
}
