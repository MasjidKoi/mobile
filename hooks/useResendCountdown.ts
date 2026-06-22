import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Resend cooldown for the OTP screen. Seeds from the server's
 * `retry_after_seconds` and persists the resend-available-at timestamp per
 * email, so the countdown survives an app restart (re-derived from wall-clock,
 * not a paused in-memory counter). `restart(secs)` resets it after a resend.
 */
const key = (email: string) => `masjidkoi.otp.resendAt.${email}`;

export function useResendCountdown(email: string, initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const target = useRef(0);

  const sync = useCallback(() => {
    setSeconds(Math.max(0, Math.ceil((target.current - Date.now()) / 1000)));
  }, []);

  const restart = useCallback(
    async (secs: number) => {
      target.current = Date.now() + secs * 1000;
      setSeconds(secs);
      try {
        await AsyncStorage.setItem(key(email), String(target.current));
      } catch {
        // Non-fatal — the countdown just won't survive a restart.
      }
    },
    [email],
  );

  // Hydrate the target from storage (survives restart); else seed from initial.
  useEffect(() => {
    let active = true;
    (async () => {
      let stored: number | null = null;
      try {
        const raw = await AsyncStorage.getItem(key(email));
        stored = raw ? Number(raw) : null;
      } catch {
        stored = null;
      }
      if (!active) return;
      if (stored && stored > Date.now()) {
        target.current = stored;
        sync();
      } else {
        await restart(initialSeconds);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Tick once a second while counting down.
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, [seconds, sync]);

  return { seconds, restart };
}
