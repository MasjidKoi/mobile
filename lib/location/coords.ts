import type { Coords } from "./types";

/**
 * Round coords to ~11m (4 decimal places). GPS returns full-precision floats
 * that jitter between fixes; quantizing them before they become React Query
 * keys collapses that jitter so we don't spawn a fresh cache entry + network
 * request (the rate-limited `/masjids/nearby`) on every sub-meter change.
 */
export function roundCoords(coords: Coords, decimals = 4): Coords {
  const f = 10 ** decimals;
  return { lat: Math.round(coords.lat * f) / f, lng: Math.round(coords.lng * f) / f };
}
