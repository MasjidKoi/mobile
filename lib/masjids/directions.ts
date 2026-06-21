import { Linking, Platform } from "react-native";

/**
 * Open turn-by-turn directions to a masjid in the platform's native maps app:
 * Apple Maps on iOS (`maps://`), Google Maps on Android (universal `?api=1`
 * URL). Both hand off straight to the installed app — no Safari detour — and
 * route from the user's current location to the destination coordinates.
 */
export function openDirections(latitude: number, longitude: number): Promise<void> {
  const dest = `${latitude},${longitude}`;
  const url =
    Platform.OS === "ios"
      ? `maps://?daddr=${dest}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  // Best-effort: callers fire-and-forget, so swallow a missing-handler rejection
  // rather than surfacing an unhandled promise rejection.
  return Linking.openURL(url)
    .then(() => undefined)
    .catch(() => undefined);
}
