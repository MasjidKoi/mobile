/** Geographic coordinate pair (degrees). */
export interface Coords {
  lat: number;
  lng: number;
}

/** Where the currently-resolved coords came from, cheapest fallback last. */
export type LocationSource = "gps" | "city" | "lastKnown" | "none";

/** Foreground location permission state (mirrors expo-location's grant model). */
export type LocationPermission = "undetermined" | "granted" | "denied";

/** The location authority's current resolution, shared via `useLocation()`. */
export interface ResolvedLocation {
  coords: Coords | null;
  source: LocationSource;
  permission: LocationPermission;
  /** True while a GPS fix is being acquired. */
  isResolving: boolean;
  /** Id of the manually-picked fallback city (when source === "city"), else null. */
  cityId: string | null;
}
