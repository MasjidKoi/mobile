/**
 * Seen-badge store. There's no "badge just earned" push, so the client detects a
 * freshly-earned tier by diffing `GET /users/me/badges` against the set of
 * tiers it has already celebrated. Device-local (AsyncStorage). On first run the
 * set is seeded with whatever is already earned, so existing badges don't all
 * re-celebrate. Keyed `badge_type:tier`.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "masjidkoi.seenBadges.v1";

export function badgeKey(badgeType: string, tier: number): string {
  return `${badgeType}:${tier}`;
}

export async function getSeenBadges(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** True if the set had never been initialized (used to seed without celebrating). */
export async function isSeenStoreUninitialized(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) == null;
  } catch {
    return false;
  }
}

export async function setSeenBadges(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(keys));
  } catch {
    // Non-fatal.
  }
}
