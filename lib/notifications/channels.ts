/**
 * Android notification channels. The scheme is `azan_{voice}_{group}` with Fajr
 * in its own channel **from day one** so future muezzin voice packs (and a
 * louder/quieter Fajr) need no channel migration. Pre-azan reminders and the
 * Ramadan suhoor/iftar alerts get their own channels too. iOS ignores channels.
 *
 * Custom channel *sounds* require the bundled azan asset (registered in the
 * expo-notifications plugin); until then channels use the default sound.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PrayerName } from "@/lib/prayer/types";

import type { ReminderPrefs } from "./settingsStore";

export const RAMADAN_CHANNEL = "ramadan";

const CHANNELS: { id: string; name: string }[] = [
  { id: "prayer_reminder_main", name: "Prayer reminders" },
  { id: "prayer_reminder_fajr", name: "Fajr reminder" },
  { id: "azan_default_main", name: "Azan" },
  { id: "azan_default_fajr", name: "Fajr azan" },
  { id: RAMADAN_CHANNEL, name: "Ramadan (suhoor & iftar)" },
];

export function channelForReminder(prayer: PrayerName): string {
  return prayer === "fajr" ? "prayer_reminder_fajr" : "prayer_reminder_main";
}

export function channelForAzan(prayer: PrayerName, prefs: ReminderPrefs): string {
  return prayer === "fajr" && prefs.fajrSeparate ? "azan_default_fajr" : "azan_default_main";
}

/** Foreground display behaviour — show the banner + play the sound. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Create the Android channels (idempotent — safe to call on every launch). */
export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    for (const channel of CHANNELS) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  } catch {
    // Non-fatal — scheduling falls back to the default channel.
  }
}
