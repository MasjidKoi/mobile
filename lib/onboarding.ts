/**
 * First-run onboarding flag. We only need to remember a single boolean — "has
 * this device finished the intro?" — so a plain AsyncStorage key is the right
 * tool (no encryption / structured store needed).
 *
 * The key is versioned so that if the intro is meaningfully reworked later we
 * can bump `v1` → `v2` to re-show it to everyone.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "masjidkoi.onboarding.completed.v1";

/** True once the user has finished (or skipped) the intro carousel. */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "true";
  } catch {
    // Storage read failed — fail open and show onboarding rather than crash.
    return false;
  }
}

/** Mark onboarding done. Called on both "Start" and "Skip". */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "true");
  } catch {
    // Non-fatal: worst case the user sees the intro again next launch.
  }
}

/** Clear the flag so the intro shows again — handy for QA / "reset" actions. */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
