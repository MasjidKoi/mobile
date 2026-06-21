/**
 * Masjid submission API — the contribute-a-masjid flow. Mirrors
 * `backend/app/schemas/masjid_submission.py`. Unlike the public masjid reads
 * (`api.ts`), these require auth (Bearer token attached by default).
 *
 * Endpoints:
 *   - POST /masjids/submissions        — create a submission
 *   - POST /masjids/submissions/photo  — pre-upload a photo, returns a key
 *   - GET  /me/submissions             — the submitter's own list
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type SubmissionStatus = "pending" | "approved" | "rejected";

/** Request body for `POST /masjids/submissions` — name + coordinates required. */
export interface MasjidSubmissionCreate {
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  /** Key returned by the photo pre-upload, if any. */
  photo_key?: string | null;
}

/** The submitter's view of a submission (`POST` response + `GET /me/submissions`). */
export interface MasjidSubmissionResponse {
  submission_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_key: string | null;
  status: SubmissionStatus;
  /** Set once approved → the live masjid it became. */
  approved_masjid_id: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Returned by the pre-submission photo upload. */
export interface SubmissionPhotoUploadResponse {
  photo_key: string;
  url: string;
}

/** A picked image to attach (shape from `expo-image-picker` assets). */
export interface SubmissionPhotoAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export function submitMasjid(body: MasjidSubmissionCreate): Promise<MasjidSubmissionResponse> {
  return api.post<MasjidSubmissionResponse>(ENDPOINTS.masjids.submissions, body);
}

export function fetchMySubmissions(): Promise<MasjidSubmissionResponse[]> {
  return api.get<MasjidSubmissionResponse[]>(ENDPOINTS.me.submissions);
}

/**
 * Build the multipart `FormData` for a photo upload. RN's FormData accepts a
 * `{ uri, name, type }` file part; `fetch` sets the boundary. Shared by the
 * submission-photo and community-photo upload paths so the field name and MIME
 * fallback can never drift apart.
 */
export function buildPhotoFormData(asset: SubmissionPhotoAsset): FormData {
  const name = asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg";
  const type = asset.mimeType ?? "image/jpeg";
  const form = new FormData();
  form.append("file", { uri: asset.uri, name, type } as unknown as Blob);
  return form;
}

/** Multipart upload — the client sends `FormData` verbatim (boundary set by fetch). */
export function uploadSubmissionPhoto(
  asset: SubmissionPhotoAsset,
): Promise<SubmissionPhotoUploadResponse> {
  return api.post<SubmissionPhotoUploadResponse>(
    ENDPOINTS.masjids.submissionPhoto,
    buildPhotoFormData(asset),
  );
}
