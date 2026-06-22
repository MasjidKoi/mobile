/**
 * Azan sound registry + preview. One bundled ~28 s azan excerpt plus the
 * standard "default tone" and "silent" options (Fajr can use a separate sound).
 * Preview plays through `expo-audio`.
 *
 * The bundled azan asset is a launch deliverable; until `assets/sounds/azan.*`
 * exists, the `mecca`/`classic` options carry no `asset` and preview is a no-op.
 */
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

import type { AzanSoundId } from "./settingsStore";

export interface AzanSoundOption {
  id: AzanSoundId;
  /** i18n key for the display name. */
  nameKey: string;
  /** `require(...)` of the bundled audio, when available. */
  asset?: number;
}

export const AZAN_SOUNDS: readonly AzanSoundOption[] = [
  // asset: require("@/assets/sounds/azan-mecca.mp3"), — add when the clip lands.
  { id: "mecca", nameKey: "azanSound.options.mecca" },
  { id: "classic", nameKey: "azanSound.options.classic" },
  { id: "default", nameKey: "azanSound.options.default" },
  { id: "silent", nameKey: "azanSound.options.silent" },
];

export function azanSoundOption(id: AzanSoundId): AzanSoundOption {
  return AZAN_SOUNDS.find((s) => s.id === id) ?? AZAN_SOUNDS[0];
}

let activePlayer: AudioPlayer | null = null;

/** Preview a sound choice. No-op for `silent`/`default` or until the asset ships. */
export function previewAzanSound(id: AzanSoundId): void {
  const option = azanSoundOption(id);
  if (!option.asset) return;
  try {
    activePlayer?.remove();
    activePlayer = createAudioPlayer(option.asset);
    activePlayer.play();
  } catch {
    // Non-fatal — preview is best-effort.
  }
}

export function stopAzanPreview(): void {
  try {
    activePlayer?.remove();
  } catch {
    // Non-fatal.
  }
  activePlayer = null;
}
