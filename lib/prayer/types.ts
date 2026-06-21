/**
 * Prayer-time, Jumu'ah and app-config types — mirror
 * `backend/app/schemas/{prayer_times,platform_settings}.py`. All clock fields
 * are `"HH:MM"` 24-hour **local wall-clock** strings (no timezone offset); they
 * are local to the masjid's `timezone`. Iqamah fields are null until an admin
 * sets them. Sunrise is not included, and Jumu'ah lives on a separate endpoint.
 */

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerTimeResponse {
  prayer_time_id: string;
  masjid_id: string;
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  fajr_azan: string;
  dhuhr_azan: string;
  asr_azan: string;
  maghrib_azan: string;
  isha_azan: string;
  fajr_iqamah: string | null;
  dhuhr_iqamah: string | null;
  asr_iqamah: string | null;
  maghrib_iqamah: string | null;
  isha_iqamah: string | null;
  is_manual: boolean;
  calculation_method: string;
  madhab: string;
  updated_at: string;
}

export interface PrayerTimesListResponse {
  dates: PrayerTimeResponse[];
  total: number;
}

export interface JumahResponse {
  masjid_id: string;
  khutbah_1_azan: string | null;
  khutbah_1_start: string | null;
  khutbah_2_azan: string | null;
  khutbah_2_start: string | null;
  notes: string | null;
  updated_at: string;
}

/** `GET /app-config` — public, rarely-changing app configuration. */
export interface AppConfigResponse {
  /** Hijri date adjustment, -2..+2 days. */
  hijri_offset_days: number;
  default_calc_method: string;
  default_madhab: string;
  platform_name: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
}
