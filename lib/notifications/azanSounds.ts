/**
 * Azan → notification-sound mapping, shared by the Android channel factory and
 * the iOS per-notification sound. Kept free of `expo-audio` (unlike `sounds.ts`,
 * which owns the in-app *preview*) so the scheduler/channel graph stays light.
 *
 * The bundled `.wav` files are registered with the `expo-notifications` config
 * plugin (see app.json → `sounds`) and copied into the iOS app bundle and
 * Android `res/raw` at build time. Filenames are underscore-only — Android
 * `res/raw` resource names reject hyphens. Adding a new muezzin "voice" is just
 * a new entry here + its `.wav` in `sounds` (the channel scheme needs no
 * migration — see channels.ts).
 */
import type { AzanSoundId } from "./settingsStore";

/** All azan voices, in display order. Drives the Android channel matrix. */
export const AZAN_SOUND_IDS: readonly AzanSoundId[] = ["mecca", "classic", "default", "silent"];

/** Bundled notification-sound filename per voice; null = no custom file. */
const NOTIF_SOUND_FILE: Record<AzanSoundId, string | null> = {
  mecca: "azan_mecca.wav",
  classic: "azan_madina.wav",
  default: null,
  silent: null,
};

/** English channel label (Android channel names aren't re-localizable once created). */
const VOICE_LABEL: Record<AzanSoundId, string> = {
  mecca: "Makkah",
  classic: "Madinah",
  default: "Default tone",
  silent: "Silent",
};

/** iOS `NotificationContentInput.sound`: filename | "default" | false (silent). */
export function azanContentSound(id: AzanSoundId): string | false {
  const file = NOTIF_SOUND_FILE[id];
  if (file) return file;
  return id === "silent" ? false : "default";
}

/**
 * Android channel sound: a filename for a custom voice, `null` for silent, or
 * `undefined` to leave the channel on the system default. Build the channel with
 * the key omitted when this returns `undefined`.
 */
export function azanChannelSound(id: AzanSoundId): string | null | undefined {
  const file = NOTIF_SOUND_FILE[id];
  if (file) return file;
  return id === "silent" ? null : undefined;
}

export function azanVoiceLabel(id: AzanSoundId): string {
  return VOICE_LABEL[id];
}
