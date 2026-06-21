import { Linking } from "react-native";

/**
 * Open turn-by-turn directions to a masjid in the device's maps app. Uses the
 * universal Google Maps URL (`?api=1`), which hands off to the Google Maps app
 * when installed and otherwise falls back to Apple Maps / the browser.
 */
export function openDirections(latitude: number, longitude: number): Promise<void> {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  // Best-effort: callers fire-and-forget, so swallow a missing-handler rejection
  // rather than surfacing an unhandled promise rejection.
  return Linking.openURL(url)
    .then(() => undefined)
    .catch(() => undefined);
}
