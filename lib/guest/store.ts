/**
 * On-device store for guest data that must survive until the user logs in, at
 * which point it migrates to their account (see ./migration).
 *
 * Phase 1 ships the shape + accessors but no real payloads yet: favourites are
 * written by Discovery (Phase 3) and reminder prefs by Prayer Times (Phase 4).
 * Establishing the store now means those phases just call the setters here and
 * the migration runner already fires at the right moment (first login).
 *
 * Plain AsyncStorage (not secure-store) — this is non-sensitive UX state — and
 * fails open, mirroring lib/onboarding.ts: a storage error degrades to empty
 * defaults rather than crashing.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "masjidkoi.guest.store.v1";

/** Per-masjid prayer-reminder preferences. Shape firmed up in Phase 4. */
export type GuestReminderPrefs = Record<string, unknown>;

export type GuestData = {
  /** Masjid IDs the guest favourited (Phase 3). */
  favourites: string[];
  /** Per-masjid prayer-reminder preferences (Phase 4). */
  reminderPrefs: GuestReminderPrefs;
};

const EMPTY: GuestData = { favourites: [], reminderPrefs: {} };

export async function getGuestData(): Promise<GuestData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<GuestData>;
    return {
      favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
      reminderPrefs:
        parsed.reminderPrefs && typeof parsed.reminderPrefs === "object"
          ? (parsed.reminderPrefs as GuestReminderPrefs)
          : {},
    };
  } catch {
    return { ...EMPTY };
  }
}

async function setGuestData(data: GuestData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Non-fatal.
  }
}

/** True if the guest accumulated anything worth migrating. */
export function hasGuestData(data: GuestData): boolean {
  return data.favourites.length > 0 || Object.keys(data.reminderPrefs).length > 0;
}

/** Add a favourite masjid (Discovery, Phase 3). Idempotent. */
export async function addGuestFavourite(masjidId: string): Promise<void> {
  const data = await getGuestData();
  if (!data.favourites.includes(masjidId)) {
    data.favourites.push(masjidId);
    await setGuestData(data);
  }
}

/** Remove a favourite masjid (Discovery, Phase 3). */
export async function removeGuestFavourite(masjidId: string): Promise<void> {
  const data = await getGuestData();
  await setGuestData({
    ...data,
    favourites: data.favourites.filter((id) => id !== masjidId),
  });
}

/** Wipe local guest data — called once the migration has pushed it to the account. */
export async function clearGuestData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Non-fatal.
  }
}
