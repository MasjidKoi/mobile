import { useMutation } from "@tanstack/react-query";

import { submitReport, type MasjidReportCreate } from "@/lib/masjids/profile-api";

/**
 * `POST /masjids/{id}/report` — suggest an edit to a displayed field. Guest-
 * allowed (no login gate); attributes to the user when a token is present. A
 * 429 surfaces as `ApiError` for the caller to present.
 */
export function useSuggestEdit(masjidId: string) {
  return useMutation({
    mutationFn: (body: MasjidReportCreate) => submitReport(masjidId, body),
  });
}
