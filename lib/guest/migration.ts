/**
 * One-shot, idempotent migration of on-device guest data into a freshly
 * authenticated account. Called from AuthProvider.login() right after tokens
 * are stored and before any post-login continuation (the gated action) resumes,
 * so favourites/reminders are already on the account when the action runs.
 *
 * Idempotency: a versioned done-flag guards the happy path; logout() resets it
 * so a later login (possibly a different account) migrates fresh guest data.
 * Each push step is also written to be safe to re-run after a crash mid-flight
 * (server unions follows/favourites; server wins on conflict).
 *
 * Phase 1 has nothing to push yet (favourites = Phase 3, reminders = Phase 4),
 * so this currently only clears local state + sets the flag. The call site and
 * idempotency contract are established now; later phases add their push steps
 * inside the `hasGuestData` branch.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { clearGuestData, getGuestData, hasGuestData } from "./store";

const DONE_KEY = "masjidkoi.guest.migration.done.v1";

async function isMigrationDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DONE_KEY)) === "true";
  } catch {
    return false;
  }
}

async function markMigrationDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(DONE_KEY, "true");
  } catch {
    // Non-fatal — worst case the (idempotent) migration runs again next login.
  }
}

export async function runGuestMigration(): Promise<void> {
  if (await isMigrationDone()) return;

  const data = await getGuestData();
  if (hasGuestData(data)) {
    // Phase 3/4 add their server pushes here, e.g.:
    //   await Promise.all(data.favourites.map((id) => api.post(ENDPOINTS.masjids.follow(id))));
    //   await registerReminderPrefs(data.reminderPrefs);
    // Union + server-wins semantics keep each push safe to re-run.
  }

  await clearGuestData();
  await markMigrationDone();
}

/** Clear the done-flag (on logout) so a future login re-runs the migration. */
export async function resetGuestMigration(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DONE_KEY);
  } catch {
    // Non-fatal.
  }
}
