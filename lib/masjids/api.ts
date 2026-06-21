/**
 * MasjidApiClient — typed fetchers over the public masjid + prayer endpoints.
 * All are unauthenticated (`auth: false`) so guests work without a token. Hooks
 * in `hooks/` wrap these with React Query.
 */
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Coords } from "@/lib/location/types";
import type { JumahResponse, PrayerTimesListResponse } from "@/lib/prayer/types";

import type {
  MasjidFacilityFilters,
  MasjidNearbyResult,
  MasjidResponse,
  MasjidSearchResult,
} from "./types";

type QueryValue = string | number | boolean | undefined | null;

/** Build a `?a=b&c=d` suffix, dropping undefined/null values. Shared with the profile API. */
export function qs(params: Record<string, QueryValue>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** `GET /masjids/nearby` — PostGIS proximity search with optional facility filters. */
export function fetchNearby(
  coords: Coords,
  filters?: MasjidFacilityFilters,
  radiusM?: number,
): Promise<MasjidNearbyResult[]> {
  // Facility filters are presence toggles: only send the ones set to true so an
  // unset/false filter means "don't care" rather than "exclude masjids with it".
  const activeFilters: Record<string, true> = {};
  if (filters) {
    for (const [k, v] of Object.entries(filters)) if (v) activeFilters[k] = true;
  }
  const query = qs({ lat: coords.lat, lng: coords.lng, radius_m: radiusM, ...activeFilters });
  return api.get<MasjidNearbyResult[]>(`${ENDPOINTS.masjids.nearby}${query}`, { auth: false });
}

/** `GET /masjids/search` — text search, with optional distance bias from `coords`. */
export function fetchSearch(q: string, coords?: Coords | null): Promise<MasjidSearchResult[]> {
  const query = qs({ q, lat: coords?.lat, lng: coords?.lng });
  return api.get<MasjidSearchResult[]>(`${ENDPOINTS.masjids.search}${query}`, { auth: false });
}

/** `GET /masjids/{id}` — full masjid detail. */
export function fetchMasjid(id: string): Promise<MasjidResponse> {
  return api.get<MasjidResponse>(ENDPOINTS.masjids.byId(id), { auth: false });
}

/** `GET /masjids/{id}/prayer-times` — 1–7 days from `date` (default today, masjid tz). */
export function fetchPrayerTimes(
  id: string,
  params?: { date?: string; days?: number },
): Promise<PrayerTimesListResponse> {
  const query = qs({ date: params?.date, days: params?.days });
  return api.get<PrayerTimesListResponse>(`${ENDPOINTS.masjids.prayerTimes(id)}${query}`, {
    auth: false,
  });
}

/** `GET /masjids/{id}/jumah` — Friday khutbah/jamaat schedule. */
export function fetchJumah(id: string): Promise<JumahResponse> {
  return api.get<JumahResponse>(ENDPOINTS.masjids.jumah(id), { auth: false });
}
