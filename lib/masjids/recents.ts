/**
 * Recently-viewed masjid IDs, most-recent first. On-device only (plain
 * AsyncStorage), fails open like lib/onboarding.ts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "masjidkoi.recents.v1";
const MAX = 10;

export async function getRecentMasjids(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Record a viewed masjid: moves it to the front, de-dupes, caps at MAX. */
export async function recordRecentMasjid(masjidId: string): Promise<string[]> {
  // `getRecentMasjids` already fails open to [], so `current` is safe. Compute
  // `next` first and always return it (containing masjidId) — a failed write
  // must not collapse the caller's in-memory list to [].
  const current = await getRecentMasjids();
  const next = [masjidId, ...current.filter((id) => id !== masjidId)].slice(0, MAX);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Non-fatal — the in-memory cache still reflects the intended order.
  }
  return next;
}
