/**
 * On-device persistence for the location authority: the manually-picked
 * fallback city and the last successful GPS fix (reused as a fast cold-start
 * fallback). Plain AsyncStorage, fails open like lib/onboarding.ts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Coords } from "./types";

const KEY = "masjidkoi.location.v1";

export interface PersistedLocation {
  /** Manually-picked city id (location-denied fallback), or null. */
  cityId: string | null;
  /** Last successful GPS fix, reused as a fast fallback on next launch. */
  lastKnown: Coords | null;
}

const EMPTY: PersistedLocation = { cityId: null, lastKnown: null };

export async function getPersistedLocation(): Promise<PersistedLocation> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<PersistedLocation>;
    const lk = parsed.lastKnown;
    return {
      cityId: typeof parsed.cityId === "string" ? parsed.cityId : null,
      lastKnown:
        lk && Number.isFinite(lk.lat) && Number.isFinite(lk.lng)
          ? { lat: lk.lat, lng: lk.lng }
          : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

async function merge(patch: Partial<PersistedLocation>): Promise<void> {
  try {
    const current = await getPersistedLocation();
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // Non-fatal.
  }
}

export function setPersistedCity(cityId: string | null): Promise<void> {
  return merge({ cityId });
}

export function setPersistedLastKnown(lastKnown: Coords): Promise<void> {
  return merge({ lastKnown });
}
