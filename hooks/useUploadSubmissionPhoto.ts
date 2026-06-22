import { useMutation } from "@tanstack/react-query";

import { uploadSubmissionPhoto, type SubmissionPhotoAsset } from "@/lib/masjids/submissions";

/**
 * `POST /masjids/submissions/photo` — pre-upload a picked image and get back a
 * `photo_key` to attach to the subsequent submission create.
 */
export function useUploadSubmissionPhoto() {
  return useMutation({
    mutationFn: (asset: SubmissionPhotoAsset) => uploadSubmissionPhoto(asset),
  });
}
