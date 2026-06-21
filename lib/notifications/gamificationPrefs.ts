/**
 * Local gamification nudge preferences (Journal Setup, screen 111). Device-local
 * (AsyncStorage), not synced — mirrors `settingsStore.ts`. Drives the local
 * notifications built by `buildNudgePlan` (see `nudges.ts`). Fails open to the
 * defaults.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "masjidkoi.gamificationPrefs.v1";

export interface GamificationPrefs {
  /** Master switch (nudges deliver only if the OS permission is also granted). */
  enabled: boolean;
  /** Evening reminder to log today's prayers. */
  dailyLog: boolean;
  /** Hour (0–23, Dhaka) for the daily-log reminder. */
  dailyLogHour: number;
  /** Reminder when today is still incomplete and the streak is at risk. */
  streakAtRisk: boolean;
  /** Friday nudge to write the weekly reflection. */
  weeklyReflection: boolean;
}

export const DEFAULT_GAMIFICATION_PREFS: GamificationPrefs = {
  enabled: true,
  dailyLog: true,
  dailyLogHour: 20,
  streakAtRisk: true,
  weeklyReflection: true,
};

export async function getGamificationPrefs(): Promise<GamificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_GAMIFICATION_PREFS };
    const p = JSON.parse(raw) as Partial<GamificationPrefs>;
    return { ...DEFAULT_GAMIFICATION_PREFS, ...p };
  } catch {
    return { ...DEFAULT_GAMIFICATION_PREFS };
  }
}

export async function setGamificationPrefs(
  patch: Partial<GamificationPrefs>,
): Promise<GamificationPrefs> {
  const current = await getGamificationPrefs();
  const next = { ...current, ...patch };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Non-fatal.
  }
  return next;
}
