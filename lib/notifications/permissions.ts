/** Notification OS-permission helpers, mirroring the location permission flow. */
import * as Notifications from "expo-notifications";

import { clearPermissionDenied, recordPermissionDenied } from "@/lib/permissions";

export type NotificationPermission = "granted" | "denied" | "undetermined";

function toPermission(status: Notifications.PermissionStatus): NotificationPermission {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export async function getNotificationStatus(): Promise<NotificationPermission> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return toPermission(status);
  } catch {
    return "undetermined";
  }
}

/** Prompt for the OS permission; records a denial so the explainer can adapt. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    const perm = toPermission(status);
    if (perm === "denied") await recordPermissionDenied("notifications");
    else if (perm === "granted") await clearPermissionDenied("notifications");
    return perm;
  } catch {
    return "undetermined";
  }
}
