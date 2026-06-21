/**
 * Donation + recurring types — mirror `backend/app/schemas/{donation,
 * recurring_schedule}.py` verbatim (snake_case JSON). UUIDs/datetimes are
 * strings; **money is decimal-as-string** over the wire (parse with `Number()`
 * before formatting). Outbound `amount` is sent as a JSON number (FastAPI
 * coerces to Decimal).
 */

/** Donor-selectable categories. `campaign` is forced server-side for campaign gifts. */
export type DonationCategory = "general" | "building" | "zakat" | "sadaqah" | "lillah";

/** Lifecycle of a single donation. */
export type DonationStatus = "pending" | "completed" | "failed" | "refunded";

/** Reminder cadence. `nightly` powers the Last-10-Nights preset (reminders only). */
export type RecurringFrequency = "weekly" | "monthly" | "nightly";

export type RecurringStatus = "active" | "paused" | "cancelled";

// ---- Create (checkout init) -------------------------------------------------

export interface DonationCreate {
  amount: number;
  category?: DonationCategory;
  /** `null` → fall back to the user's `donate_anonymously_by_default`. */
  is_anonymous?: boolean | null;
  donor_name?: string | null;
}

/** Campaign gift — masjid + `campaign` category are derived server-side. */
export interface CampaignDonationCreate {
  amount: number;
  is_anonymous?: boolean | null;
  donor_name?: string | null;
}

/** `POST /masjids/{id}/donations` | `POST /campaigns/{id}/donations`. */
export interface CheckoutInitResponse {
  donation_id: string;
  status: DonationStatus;
  gross_amount: string;
  /** "Masjid receives ~৳X" — a pre-confirm estimate net of the platform fee. */
  estimated_net: string;
  /** SSLCommerz hosted-checkout URL to open in the browser. */
  gateway_url: string;
}

// ---- Read -------------------------------------------------------------------

/** `GET /donations/{id}` — owner-only. */
export interface DonationStatusResponse {
  donation_id: string;
  status: DonationStatus;
  category: DonationCategory | "campaign";
  masjid_id: string;
  campaign_id: string | null;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  is_anonymous: boolean;
  /** "MK-2025-000001" — null until completed. */
  receipt_number: string | null;
  gateway_payment_method: string | null;
  completed_at: string | null;
  created_at: string;
}

/** Filters for `GET /me/donations` (keyset paginated). */
export interface DonationHistoryFilters {
  masjid_id?: string;
  category?: DonationCategory | "campaign";
  status?: DonationStatus;
  year?: number;
}

export interface DonationHistoryItem {
  donation_id: string;
  masjid_id: string;
  masjid_name: string;
  campaign_id: string | null;
  category: DonationCategory | "campaign";
  gross_amount: string;
  status: DonationStatus;
  is_anonymous: boolean;
  receipt_number: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface DonationHistoryResponse {
  items: DonationHistoryItem[];
  /** Opaque keyset cursor; `null` when the list is exhausted. */
  next_cursor: string | null;
}

export interface DonationSummaryPerMasjid {
  masjid_id: string;
  masjid_name: string;
  total: string;
}

/** `GET /me/donations/summary`. */
export interface DonationSummary {
  lifetime_total: string;
  this_year_total: string;
  year: number;
  per_masjid: DonationSummaryPerMasjid[];
}

// ---- Recurring schedules (reminders, NOT auto-charge) -----------------------

export interface RecurringScheduleCreate {
  masjid_id?: string | null;
  campaign_id?: string | null;
  amount: number;
  category?: DonationCategory;
  frequency: RecurringFrequency;
  start_date?: string | null;
  end_date?: string | null;
}

export interface RecurringScheduleUpdate {
  status?: RecurringStatus;
  amount?: number;
}

export interface RecurringSchedule {
  schedule_id: string;
  masjid_id: string;
  campaign_id: string | null;
  category: DonationCategory | "campaign";
  amount: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  next_due_at: string;
  status: RecurringStatus;
  created_at: string;
}

export interface RecurringScheduleListResponse {
  items: RecurringSchedule[];
}
