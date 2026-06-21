/**
 * ProfileApiClient — typed fetchers for the masjid-profile extras (campaigns,
 * reviews aggregate) and the three contribution channels: community photos,
 * ask-the-masjid Q&A, and suggest-an-edit (the per-field report endpoint).
 * Mirrors the backend schemas (snake_case JSON; UUIDs/datetimes are strings).
 *
 * Auth posture, per the binding contract:
 *   - public reads (campaigns, answered questions, reviews, community photos,
 *     follower count) pass `auth: false` so guests work without a token;
 *   - contribution writes that require accountability (ask, photo upload,
 *     follow/unfollow) use the default Bearer auth — callers gate them via
 *     `requireAuth`;
 *   - suggest-an-edit (`/report`) is guest-allowed but still sends the Bearer
 *     token when one exists, so the backend can attribute the report (and award
 *     contribution credit) to a signed-in user.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { qs } from "./api";
import { buildPhotoFormData, type SubmissionPhotoAsset } from "./submissions";

/** Append a `?page=…` style query (delegates to the shared `qs` builder). */
function withQuery(path: string, params: Parameters<typeof qs>[0]): string {
  return `${path}${qs(params)}`;
}

// ---- Campaigns --------------------------------------------------------------

export type CampaignStatus = "Active" | "Completed" | "Cancelled";

/** A fundraising campaign from `GET /masjids/{id}/campaigns`. Money is decimal-as-string. */
export interface CampaignResponse {
  campaign_id: string;
  masjid_id: string;
  title: string;
  description: string | null;
  target_amount: string;
  raised_amount: string;
  progress_pct: number;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  days_remaining: number;
  status: CampaignStatus;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignListResponse {
  items: CampaignResponse[];
  total: number;
  page: number;
  page_size: number;
}

export function fetchCampaigns(
  id: string,
  params?: { page?: number; page_size?: number; status?: CampaignStatus },
): Promise<CampaignListResponse> {
  return api.get<CampaignListResponse>(
    withQuery(ENDPOINTS.masjids.campaigns(id), {
      page: params?.page,
      page_size: params?.page_size,
      status: params?.status,
    }),
    { auth: false },
  );
}

// ---- Q&A --------------------------------------------------------------------

export type QuestionStatus = "pending" | "answered" | "rejected";

/** A publicly listed, *answered* question (`GET /masjids/{id}/questions`). */
export interface QuestionPublic {
  question_id: string;
  masjid_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  answer_author_role: string | null;
}

export interface QuestionPublicListResponse {
  items: QuestionPublic[];
  total: number;
  page: number;
  page_size: number;
}

/** The asker's own view of a question, with its moderation status. */
export interface MyQuestion {
  question_id: string;
  masjid_id: string;
  question: string;
  status: QuestionStatus;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
}

export function fetchAnsweredQuestions(
  id: string,
  params?: { page?: number; page_size?: number },
): Promise<QuestionPublicListResponse> {
  return api.get<QuestionPublicListResponse>(
    withQuery(ENDPOINTS.masjids.questions(id), {
      page: params?.page,
      page_size: params?.page_size,
    }),
    { auth: false },
  );
}

/** `POST /masjids/{id}/questions` — ask the masjid (auth + rate-limited). */
export function askQuestion(id: string, question: string): Promise<MyQuestion> {
  return api.post<MyQuestion>(ENDPOINTS.masjids.questions(id), { question });
}

export function fetchMyQuestions(): Promise<MyQuestion[]> {
  return api.get<MyQuestion[]>(ENDPOINTS.me.questions);
}

// ---- Reviews (aggregate only this phase) ------------------------------------

export interface MasjidReview {
  review_id: string;
  masjid_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  reviewer_display_name: string | null;
  edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewListResponse {
  items: MasjidReview[];
  total: number;
  page: number;
  page_size: number;
  average_rating: number | null;
  /** Count of reviews per star, keyed "1"–"5". Drives the distribution bars. */
  rating_distribution?: Record<string, number> | null;
}

/**
 * The profile reviews slot needs the aggregate (`average_rating`, `total`) plus a
 * few items to preview, so pull a small first page. The full paginated list lives
 * behind the "see all" screen (`useReviews`).
 */
export function fetchReviewsSummary(id: string): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(
    withQuery(ENDPOINTS.masjids.reviews(id), { page: 1, page_size: 3 }),
    { auth: false },
  );
}

// ---- Community photos -------------------------------------------------------

export type PhotoStatus = "pending" | "approved" | "rejected";

/** An approved visitor photo from the public strip. */
export interface CommunityPhotoPublic {
  photo_id: string;
  masjid_id: string;
  url: string;
  created_at: string;
}

export interface CommunityPhotoPublicListResponse {
  items: CommunityPhotoPublic[];
  total: number;
  page: number;
  page_size: number;
}

/** The contributor's own submission, with its moderation status. */
export interface CommunityPhotoSubmission {
  photo_id: string;
  masjid_id: string;
  url: string;
  status: PhotoStatus;
  created_at: string;
  updated_at: string;
}

export function fetchCommunityPhotos(
  id: string,
  params?: { page?: number; page_size?: number },
): Promise<CommunityPhotoPublicListResponse> {
  return api.get<CommunityPhotoPublicListResponse>(
    withQuery(ENDPOINTS.masjids.communityPhotos(id), {
      page: params?.page,
      page_size: params?.page_size,
    }),
    { auth: false },
  );
}

/** Multipart upload — same `{ uri, name, type }` part shape as the submission photo path. */
export function uploadCommunityPhoto(
  id: string,
  asset: SubmissionPhotoAsset,
): Promise<CommunityPhotoSubmission> {
  return api.post<CommunityPhotoSubmission>(
    ENDPOINTS.masjids.communityPhotos(id),
    buildPhotoFormData(asset),
  );
}

export function fetchMyPhotoSubmissions(): Promise<CommunityPhotoSubmission[]> {
  return api.get<CommunityPhotoSubmission[]>(ENDPOINTS.me.photoSubmissions);
}

// ---- Suggest an edit (per-field report) -------------------------------------

export interface MasjidReportCreate {
  field_name: string;
  description: string;
  /** Optional — lets a guest leave a contact for follow-up. */
  reporter_email?: string | null;
}

export interface MasjidReportResponse {
  report_id: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
}

/**
 * `POST /masjids/{id}/report` — guest-allowed (no login gate). Uses the default
 * Bearer auth so the report is attributed when the user is signed in; a guest
 * simply sends no token (the endpoint accepts an optional user).
 */
export function submitReport(
  id: string,
  body: MasjidReportCreate,
): Promise<MasjidReportResponse> {
  return api.post<MasjidReportResponse>(ENDPOINTS.masjids.report(id), body);
}

// ---- Follow -----------------------------------------------------------------
// ⚠️ No per-masjid "am I following?" read exists until Phase 8, so the mobile
// toggle is session-optimistic (see `useFollow`). These just write the edge.

export function followMasjid(id: string): Promise<unknown> {
  return api.post<unknown>(ENDPOINTS.masjids.follow(id));
}

export function unfollowMasjid(id: string): Promise<unknown> {
  return api.delete<unknown>(ENDPOINTS.masjids.follow(id));
}
