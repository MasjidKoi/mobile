/**
 * Permission helpers shared by the pre-permission explainer screens. Phase 1
 * builds the record-denial + open-settings plumbing; the *live* OS prompts are
 * wired at point-of-use later (location → map, Phase 3; notifications →
 * reminders, Phase 4), so the explainer is shown the moment a permission is
 * actually needed, never during onboarding.
 *
 * Fails open, mirroring lib/onboarding.ts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

export type PermissionKind = "location" | "notifications";

const key = (kind: PermissionKind) => `masjidkoi.permission.denied.${kind}`;

/** Remember that the user declined, so we can show a recovery path next time. */
export async function recordPermissionDenied(kind: PermissionKind): Promise<void> {
  try {
    await AsyncStorage.setItem(key(kind), "true");
  } catch {
    // Non-fatal.
  }
}

export async function wasPermissionDenied(kind: PermissionKind): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(key(kind))) === "true";
  } catch {
    return false;
  }
}

export async function clearPermissionDenied(kind: PermissionKind): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(kind));
  } catch {
    // Non-fatal.
  }
}

/** Deep-link to this app's OS settings page (to re-enable a denied permission). */
export function openAppSettings(): void {
  void Linking.openSettings();
}
