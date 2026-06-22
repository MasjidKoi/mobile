/**
 * Identifier-scoped cancellation so independent schedulers coexist. The prayer
 * reminder scheduler and the gamification nudge scheduler both run on foreground;
 * if either called `cancelAllScheduledNotificationsAsync` it would wipe the
 * other's pending notifications. Instead each cancels only the identifiers it
 * owns (by key prefix) before rescheduling.
 */
import * as Notifications from "expo-notifications";

/** Prayer-plan keys: `reminder-…`, `azan-…`, `sehri-…`/`sehri-end-…`, `iftar-…`. */
export const PRAYER_NOTIF_PREFIXES = ["reminder-", "azan-", "sehri-", "iftar-"];
/** Gamification nudge keys: `nudge-…`. */
export const NUDGE_NOTIF_PREFIX = "nudge-";

export async function cancelScheduledByPrefix(prefixes: string[]): Promise<void> {
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    const owned = pending
      .map((n) => n.identifier)
      .filter((id): id is string => !!id && prefixes.some((p) => id.startsWith(p)));
    await Promise.all(owned.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {
    // Non-fatal.
  }
}
