import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";

import { postCheckIn } from "@/lib/checkins/api";
import { qk } from "@/lib/query/keys";

/** Thrown when foreground location permission isn't granted, so the caller can
 * route to the location explainer instead of treating it as a check-in failure. */
export class CheckInPermissionError extends Error {
  constructor() {
    super("location_permission_denied");
    this.name = "CheckInPermissionError";
  }
}

/** Bound the GPS acquisition so a poor/indoor fix can't hang the mutation
 * forever — on timeout the caller surfaces the retryable check-in error screen. */
const GPS_TIMEOUT_MS = 12_000;

async function acquireCurrentPosition(): Promise<Location.LocationObject> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("location_timeout")), GPS_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Check-in mutation. The 100m geofence needs an accurate *current* fix — not the
 * shared LocationProvider fallback (which may be a manually-picked city) — so we
 * acquire a fresh high-accuracy position here, prompting for permission if
 * needed. The screen maps the result: success → 89, `400` → 90 (too far),
 * permission-denied → location explainer. Wrap the trigger in
 * `requireAuth(..., "community")`.
 */
export function useCheckIn(masjidId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      let status = (await Location.getForegroundPermissionsAsync().catch(() => null))?.status;
      if (status !== Location.PermissionStatus.GRANTED) {
        status = (await Location.requestForegroundPermissionsAsync()).status;
      }
      if (status !== Location.PermissionStatus.GRANTED) {
        throw new CheckInPermissionError();
      }
      const pos = await acquireCurrentPosition();
      return postCheckIn(masjidId, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.checkins.mine() });
    },
  });
}
