/**
 * Android notification channels. The scheme is `azan_{voice}_{group}` with Fajr
 * in its own channel **from day one** so muezzin voice packs (and a
 * louder/quieter Fajr) need no channel migration. Pre-azan reminders and the
 * Ramadan suhoor/iftar alerts get their own channels too. iOS ignores channels
 * (the per-notification `content.sound` carries the azan on iOS instead).
 *
 * The azan channels are generated from `AZAN_SOUND_IDS`, each created with its
 * bundled sound (registered in the expo-notifications plugin → app.json), so a
 * new voice is one registry entry away. Android 8+ fixes a channel's sound at
 * creation, so each voice needs its own channel.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PrayerName } from "@/lib/prayer/types";

import { AZAN_SOUND_IDS, azanChannelSound, azanVoiceLabel } from "./azanSounds";
import type { AzanSoundId, ReminderPrefs } from "./settingsStore";

export const RAMADAN_CHANNEL = "ramadan";
/** Phase 9 — journal/streak/reflection nudges. */
export const GAMIFICATION_CHANNEL = "gamification";

type ChannelDef = { id: string; name: string; sound?: string | null };

const STATIC_CHANNELS: ChannelDef[] = [
  { id: "prayer_reminder_main", name: "Prayer reminders" },
  { id: "prayer_reminder_fajr", name: "Fajr reminder" },
  { id: RAMADAN_CHANNEL, name: "Ramadan (suhoor & iftar)" },
  { id: GAMIFICATION_CHANNEL, name: "Journal & streak reminders" },
];

/** One azan channel per (voice × main/Fajr), each carrying that voice's sound. */
const AZAN_CHANNELS: ChannelDef[] = AZAN_SOUND_IDS.flatMap((voice) =>
  (["main", "fajr"] as const).map((group) => ({
    id: `azan_${voice}_${group}`,
    name: `${group === "fajr" ? "Fajr azan" : "Azan"} · ${azanVoiceLabel(voice)}`,
    sound: azanChannelSound(voice),
  })),
);

export function channelForReminder(prayer: PrayerName): string {
  return prayer === "fajr" ? "prayer_reminder_fajr" : "prayer_reminder_main";
}

/** The azan voice that applies to a prayer (Fajr can override when separated). */
export function azanVoiceFor(prayer: PrayerName, prefs: ReminderPrefs): AzanSoundId {
  return prayer === "fajr" && prefs.fajrSeparate ? prefs.fajrAzanSound : prefs.azanSound;
}

export function channelForAzan(prayer: PrayerName, prefs: ReminderPrefs): string {
  const group = prayer === "fajr" && prefs.fajrSeparate ? "fajr" : "main";
  return `azan_${azanVoiceFor(prayer, prefs)}_${group}`;
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
    for (const channel of [...STATIC_CHANNELS, ...AZAN_CHANNELS]) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: Notifications.AndroidImportance.HIGH,
        // Omit `sound` → system default; a filename → bundled azan; null → silent.
        ...(channel.sound !== undefined ? { sound: channel.sound } : {}),
      });
    }
  } catch {
    // Non-fatal — scheduling falls back to the default channel.
  }
}
