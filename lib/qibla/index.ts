/**
 * Qibla math. The bearing to the Kaaba is pure geometry (`adhan`'s great-circle
 * `Qibla`), so it works fully offline. Device heading + accuracy come from the
 * OS magnetometer (see `hooks/useQibla`). We surface accuracy honestly rather
 * than claiming a fixed precision.
 */
import { Coordinates, Qibla } from "adhan";

import type { Coords } from "@/lib/location/types";

/** Bearing to the Kaaba, degrees clockwise from true north (0–360). */
export function qiblaBearing(coords: Coords): number {
  return Qibla(new Coordinates(coords.lat, coords.lng));
}

export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export type CompassAccuracy = "high" | "medium" | "low" | "none";

/** expo-location heading accuracy (0 = unreliable … 3 = high) → a calibration tier. */
export function accuracyTier(accuracy: number): CompassAccuracy {
  if (accuracy >= 3) return "high";
  if (accuracy === 2) return "medium";
  if (accuracy === 1) return "low";
  return "none";
}

/** Below "medium" the heading is too unreliable to trust → prompt a figure-8 calibration. */
export function needsCalibration(accuracy: number): boolean {
  return accuracy < 2;
}
