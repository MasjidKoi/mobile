import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";

import type { Coords } from "@/lib/location/types";
import {
  accuracyTier,
  needsCalibration,
  normalizeDegrees,
  qiblaBearing,
  type CompassAccuracy,
} from "@/lib/qibla";
import { useLocation } from "@/providers/LocationProvider";

export interface UseQiblaResult {
  /** Qibla bearing from true north (0–360), null until coords resolve. */
  bearing: number | null;
  /** Live device heading (true north if available, else magnetic). */
  heading: number | null;
  /** Needle rotation = bearing − heading; 0 means the device points at the Qibla. */
  relativeAngle: number | null;
  /** Raw OS accuracy (0–3). */
  accuracy: number;
  accuracyTier: CompassAccuracy;
  needsCalibration: boolean;
  hasCoords: boolean;
}

/**
 * Live Qibla compass. Subscribes to the magnetometer only while `enabled` (the
 * screen passes its focused state) to spare the battery. Bearing is computed
 * offline from the resolved location; heading + accuracy stream from the OS.
 */
export function useQibla(enabled = true): UseQiblaResult {
  const { coords } = useLocation();
  const [heading, setHeading] = useState<number | null>(null);
  // Start "uncalibrated": until the first real heading event arrives we must not
  // claim the compass is accurate (or the needle pointing up is the Qibla).
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let sub: Location.LocationSubscription | null = null;
    void (async () => {
      try {
        const subscription = await Location.watchHeadingAsync((h) => {
          if (!active) return;
          const head = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          setHeading(normalizeDegrees(head));
          setAccuracy(h.accuracy);
        });
        if (active) sub = subscription;
        else subscription.remove();
      } catch {
        // Magnetometer unavailable (e.g. a simulator) — leave heading null.
      }
    })();
    return () => {
      active = false;
      sub?.remove();
    };
  }, [enabled]);

  const bearing = useMemo(
    () => (coords ? normalizeDegrees(qiblaBearing(coords as Coords)) : null),
    [coords],
  );
  const relativeAngle =
    bearing != null && heading != null ? normalizeDegrees(bearing - heading) : null;

  return {
    bearing,
    heading,
    relativeAngle,
    accuracy,
    accuracyTier: accuracyTier(accuracy),
    needsCalibration: needsCalibration(accuracy),
    hasCoords: coords != null,
  };
}
