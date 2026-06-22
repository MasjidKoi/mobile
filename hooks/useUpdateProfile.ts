import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Madhab } from "@/lib/forms/schemas";
import { qk } from "@/lib/query/keys";
import type { UserProfile } from "@/providers/AuthProvider";

/**
 * A local file to upload as the avatar. Shaped for React Native's `FormData`
 * file part — the Edit Profile screen maps an `expo-image-picker` asset onto it.
 */
export type ProfilePhotoAsset = {
  uri: string;
  name: string;
  type: string;
};

export type ProfileUpdate = {
  display_name?: string;
  madhab?: Madhab;
  photo?: ProfilePhotoAsset;
};

/**
 * `PATCH /users/me` — multipart/form-data (the client passes FormData through
 * untouched so fetch sets the boundary). Sends any provided subset of
 * name / madhab / avatar photo (the backend field is `photo`, an UploadFile).
 * Writes the fresh profile into the cache.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: ProfileUpdate) => {
      const form = new FormData();
      if (update.display_name !== undefined)
        form.append("display_name", update.display_name);
      if (update.madhab !== undefined) form.append("madhab", update.madhab);
      if (update.photo) {
        // RN's FormData accepts a `{ uri, name, type }` file descriptor.
        form.append("photo", update.photo as unknown as Blob);
      }
      return api.patch<UserProfile>(ENDPOINTS.users.me, form);
    },
    onSuccess: (data) => {
      // Write the returned profile immediately, then reconcile with GET /users/me
      // (the PATCH response may not yet carry the processed avatar URL).
      queryClient.setQueryData(qk.user.me(), data);
      void queryClient.invalidateQueries({ queryKey: qk.user.me() });
    },
  });
}
