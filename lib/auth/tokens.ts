import * as SecureStore from "expo-secure-store";

/**
 * Access + refresh tokens live in the device keychain (Keychain / Keystore) via
 * expo-secure-store — never AsyncStorage, which is plaintext. SecureStore is
 * async on RN, unlike the web app's synchronous localStorage.
 *
 * All reads/writes fail open (mirrors `lib/onboarding.ts`): a keychain error
 * means the session simply isn't persisted, not a crash.
 */
const ACCESS_KEY = "mkoi_token";
const REFRESH_KEY = "mkoi_refresh";

export async function storeTokens(access: string, refresh: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  } catch {
    // Non-fatal.
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    // Non-fatal.
  }
}
