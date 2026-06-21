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
  { id: "mecca", nameKey: "azanSound.options.mecca", asset: require("@/assets/sounds/azan-mecca.mp3") },
  { id: "classic", nameKey: "azanSound.options.classic", asset: require("@/assets/sounds/azan-madina.mp3") },
  { id: "default", nameKey: "azanSound.options.default" },
  { id: "silent", nameKey: "azanSound.options.silent" },
];

export function azanSoundOption(id: AzanSoundId): AzanSoundOption {
  return AZAN_SOUNDS.find((s) => s.id === id) ?? AZAN_SOUNDS[0];
}

let activePlayer: AudioPlayer | null = null;
let activeSub: { remove: () => void } | null = null;

/**
 * Preview a sound choice. Stops any current preview first. Returns whether
 * playback actually started (`false` for silent/default or a missing asset, so
 * the caller can skip showing a "stop" state). `onDone` fires when the clip
 * finishes on its own — adhan clips run a couple of minutes, so the UI needs to
 * reset its play/stop button both on natural end and on a manual stop.
 */
export function previewAzanSound(id: AzanSoundId, onDone?: () => void): boolean {
  stopAzanPreview();
  const option = azanSoundOption(id);
  if (!option.asset) return false;
  try {
    const player = createAudioPlayer(option.asset);
    activePlayer = player;
    activeSub = player.addListener("playbackStatusUpdate", (status) => {
      if (status.didJustFinish) {
        stopAzanPreview();
        onDone?.();
      }
    });
    player.play();
    return true;
  } catch {
    // Non-fatal — preview is best-effort.
    return false;
  }
}

export function stopAzanPreview(): void {
  try {
    activeSub?.remove();
    // pause() halts audio immediately; remove() alone releases the player object
    // but doesn't reliably stop in-flight playback.
    activePlayer?.pause();
    activePlayer?.remove();
  } catch {
    // Non-fatal.
  }
  activeSub = null;
  activePlayer = null;
}
