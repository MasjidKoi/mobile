/**
 * The user's "home masjid" — the masjid whose azan/iqamah the home screen and
 * reminder scheduler bind to. A purely on-device notion (the backend has no
 * home-masjid field); it survives guest→login like favourites/recents. Set via
 * the home "add your masjid" flow or (later) a masjid profile chip. Plain
 * AsyncStorage, fails open.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Coords } from "@/lib/location/types";

const KEY = "masjidkoi.homeMasjid.v1";

export interface HomeMasjid {
  masjidId: string;
  name: string;
  /** Masjid coordinates — used for the Travel-Mode distance check. */
  coords: Coords;
}

export async function getHomeMasjid(): Promise<HomeMasjid | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<HomeMasjid>;
    const c = p.coords;
    if (
      typeof p.masjidId === "string" &&
      typeof p.name === "string" &&
      c &&
      Number.isFinite(c.lat) &&
      Number.isFinite(c.lng)
    ) {
      return { masjidId: p.masjidId, name: p.name, coords: { lat: c.lat, lng: c.lng } };
    }
    return null;
  } catch {
    return null;
  }
}

/** Persist the home masjid; returns the value so the caller's cache can sync. */
export async function setHomeMasjidStore(home: HomeMasjid): Promise<HomeMasjid> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(home));
  } catch {
    // Non-fatal — the in-memory cache still reflects the choice.
  }
  return home;
}

export async function clearHomeMasjidStore(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Non-fatal.
  }
}
