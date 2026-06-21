/**
 * Last-celebrated streak milestone. The milestone celebration (screen 100) is a
 * display-only moment — the server has no milestone endpoint, so the client
 * detects a threshold crossing by comparing the live streak against the highest
 * milestone it has already shown. Device-local (AsyncStorage); fails open to 0.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "masjidkoi.lastMilestone.v1";

export async function getLastCelebratedMilestone(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** True when never written (used to seed without re-celebrating after reinstall). */
export async function isMilestoneStoreUninitialized(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) == null;
  } catch {
    return false;
  }
}

export async function setLastCelebratedMilestone(value: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, String(value));
  } catch {
    // Non-fatal — the milestone may simply re-celebrate next launch.
  }
}
