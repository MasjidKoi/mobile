/**
 * Account deletion (PRD 09 #38–43). The backend soft-deletes (`202 Accepted`,
 * purged within 30 days) and returns `410 Gone` thereafter — there is NO
 * reactivation path, so the UI copy promises no undo. The caller is responsible
 * for purging local state (guest store) and dropping to guest mode afterwards.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function requestAccountDeletion(): Promise<unknown> {
  return api.delete(ENDPOINTS.users.me);
}
