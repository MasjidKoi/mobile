import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Madhab } from "@/lib/forms/schemas";
import { qk } from "@/lib/query/keys";
import type { UserProfile } from "@/providers/AuthProvider";

export type ProfileUpdate = {
  display_name?: string;
  madhab?: Madhab;
};

/**
 * `PATCH /users/me` — multipart/form-data (the client passes FormData through
 * untouched so fetch sets the boundary). Photo upload is deferred to Phase 7;
 * Phase 1 sends name + madhab only. Writes the fresh profile into the cache.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: ProfileUpdate) => {
      const form = new FormData();
      if (update.display_name !== undefined) form.append("display_name", update.display_name);
      if (update.madhab !== undefined) form.append("madhab", update.madhab);
      return api.patch<UserProfile>(ENDPOINTS.users.me, form);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(qk.user.me(), data);
    },
  });
}
