import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { I18nManager } from "react-native";

import i18n, { type AppLanguage, isRTLLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n";

/**
 * Language persistence + switching (PRD 09 #16–19). The chosen language is
 * stored device-locally and re-applied at cold start (LocaleProvider), so the
 * app no longer reverts to the device locale on relaunch.
 *
 * Bengali↔English switch in place via `setAppLanguage`. Switching to/from Arabic
 * flips the layout direction, which React Native can only apply on a fresh
 * launch — `applyLanguageWithRestart` forces RTL and reloads via expo-updates.
 */
export const LANG_KEY = "masjidkoi.lang.v1";

function isSupported(value: string | null): value is AppLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export async function loadStoredLanguage(): Promise<AppLanguage | null> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    return isSupported(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Persist + apply a language that does NOT require an RTL relayout (bn ⇄ en). */
export async function setAppLanguage(language: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANG_KEY, language);
  } catch {
    // Non-fatal.
  }
  await i18n.changeLanguage(language);
}

/** Whether switching to `language` needs an RTL flip (and therefore a restart). */
export function needsRestart(language: AppLanguage): boolean {
  return isRTLLanguage(language) !== I18nManager.isRTL;
}

/**
 * Persist `language`, force the matching layout direction, and reload the app so
 * the native RTL flag takes effect. Used for the Arabic transition (screen 63).
 */
export async function applyLanguageWithRestart(language: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANG_KEY, language);
  } catch {
    // Non-fatal.
  }
  try {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTLLanguage(language));
  } catch {
    // Non-fatal on platforms without the native module.
  }
  await i18n.changeLanguage(language);
  try {
    await Updates.reloadAsync();
  } catch {
    // Dev/Expo Go may not support reloadAsync — the flag is set, so a manual
    // relaunch applies the new direction.
  }
}
