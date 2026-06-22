/**
 * Push-device registration. Best-effort: fetching an Expo push token needs an
 * EAS `projectId` (and provisioned creds), which aren't live yet, so a failure
 * here is swallowed — local reminders are unaffected. The token is cached so we
 * can prune it on logout (`DELETE /users/me/devices/{token}`).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { getNotificationStatus } from "./permissions";

const TOKEN_KEY = "masjidkoi.pushToken.v1";

function platformTag(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

function resolveProjectId(): string | undefined {
  const easConfig = (Constants as { easConfig?: { projectId?: string } }).easConfig;
  return Constants.expoConfig?.extra?.eas?.projectId ?? easConfig?.projectId;
}

/** Register this device's push token with the backend (called after login + permission grant). */
export async function registerDevice(): Promise<void> {
  try {
    // Fetching an Expo token requires the OS permission (and would throw on iOS
    // without it). Skip cleanly until the user has granted notifications.
    if ((await getNotificationStatus()) !== "granted") return;
    const projectId = resolveProjectId();
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await api.post(ENDPOINTS.users.devices, { token, platform: platformTag() });
  } catch {
    // Best-effort — no projectId / push not provisioned yet.
  }
}

/** Prune this device's token on logout (best-effort). */
export async function unregisterDevice(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      await api.delete(`${ENDPOINTS.users.devices}/${encodeURIComponent(token)}`);
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Best-effort.
  }
}
