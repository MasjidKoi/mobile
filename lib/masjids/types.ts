/**
 * Masjid discovery + detail types — mirror `backend/app/schemas/masjid.py`
 * verbatim (snake_case JSON, like UserProfile/TokenResponse). UUIDs and
 * datetimes arrive as strings over the wire.
 */

/** A pin/list result from `GET /masjids/nearby` (PostGIS proximity search). */
export interface MasjidNearbyResult {
  masjid_id: string;
  name: string;
  address: string;
  admin_region: string;
  status: string;
  verified: boolean;
  donations_enabled: boolean;
  created_at: string;
  updated_at: string;
  /** Distance from the query point, metres. */
  distance_m: number;
  latitude: number;
  longitude: number;
  has_sisters_section: boolean;
  has_wudu_area: boolean;
  has_wheelchair_access: boolean;
  has_parking: boolean;
  has_janazah: boolean;
  has_school: boolean;
  cover_photo_url: string | null;
}

/** A result from `GET /masjids/search`. `distance_m` is set only when the caller passed coords. */
export interface MasjidSearchResult {
  masjid_id: string;
  name: string;
  address: string;
  admin_region: string;
  status: string;
  verified: boolean;
  donations_enabled: boolean;
  created_at: string;
  updated_at: string;
  distance_m: number | null;
}

export interface FacilitiesResponse {
  has_sisters_section: boolean;
  has_wudu_area: boolean;
  has_wudu_male: boolean;
  has_wudu_female: boolean;
  has_wheelchair_access: boolean;
  has_parking: boolean;
  parking_capacity: number | null;
  has_janazah: boolean;
  has_school: boolean;
  imam_name: string | null;
  imam_qualifications: string | null;
  imam_languages: string | null;
  capacity_male: number | null;
  capacity_female: number | null;
  updated_at: string;
}

export interface ContactResponse {
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  website_url: string | null;
  updated_at: string;
}

export interface PhotoResponse {
  photo_id: string;
  url: string;
  is_cover: boolean;
  display_order: number;
  created_at: string;
}

/** Full masjid detail from `GET /masjids/{id}`. */
export interface MasjidResponse {
  masjid_id: string;
  name: string;
  address: string;
  admin_region: string;
  latitude: number;
  longitude: number;
  status: string;
  verified: boolean;
  donations_enabled: boolean;
  /** IANA timezone of the masjid, e.g. "Asia/Dhaka" (prayer times are local to this). */
  timezone: string;
  description: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
  facilities: FacilitiesResponse | null;
  contact: ContactResponse | null;
  photos: PhotoResponse[];
}

/** Optional facility filters accepted by `GET /masjids/nearby`. */
export interface MasjidFacilityFilters {
  has_parking?: boolean;
  has_sisters_section?: boolean;
  has_wheelchair_access?: boolean;
  has_wudu_area?: boolean;
  has_janazah?: boolean;
  has_school?: boolean;
}
