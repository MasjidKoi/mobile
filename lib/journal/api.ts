/**
 * JournalApiClient — the daily prayer/Qur'an log (Bearer; callers gate writes
 * via `requireAuth`). Hooks in `hooks/` wrap these with React Query.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { qs } from "@/lib/masjids/api";

import type { JournalEntry, JournalListResponse, JournalUpsert } from "./types";

/** `POST /users/me/journal` — field-level upsert for a date; returns the entry. */
export function upsertJournal(body: JournalUpsert): Promise<JournalEntry> {
  return api.post<JournalEntry>(ENDPOINTS.users.journal, body);
}

/** `GET /users/me/journal` — paginated history, optionally date-bounded. */
export function fetchJournal(params?: {
  page?: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
}): Promise<JournalListResponse> {
  return api.get<JournalListResponse>(
    `${ENDPOINTS.users.journal}${qs({
      page: params?.page,
      page_size: params?.page_size,
      date_from: params?.date_from,
      date_to: params?.date_to,
    })}`,
  );
}
