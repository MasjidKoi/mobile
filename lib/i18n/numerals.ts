import { createContext, useContext } from "react";

// Lazy-required inside the I/O helpers so this module (and `format.ts`, which
// imports the sync getter) stays importable in the pure-logic Jest env.
type AsyncStorageLike = { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void> };
const storage = (): AsyncStorageLike =>
  require("@react-native-async-storage/async-storage").default as AsyncStorageLike;

/**
 * Bengali-numerals preference (PRD 09 #20–23): opt-in, default OFF, visible only
 * in the Bengali UI, applied app-wide through the LocaleFormat layer.
 *
 * A module-level cache backs the *synchronous* `getBengaliNumerals()` so non-React
 * callers (the prayer formatter feeding the notification scheduler) read a
 * consistent value without a hook. React surfaces read the reactive context via
 * `useNumerals()`; both are kept in sync by the LocaleProvider.
 */
export const NUMERALS_KEY = "masjidkoi.numerals.v1";

let cached = false;

export function getBengaliNumerals(): boolean {
  return cached;
}

/** Hydrate the cache from disk (called once at cold start). */
export async function loadBengaliNumerals(): Promise<boolean> {
  try {
    cached = (await storage().getItem(NUMERALS_KEY)) === "true";
  } catch {
    // Fail open — default OFF.
  }
  return cached;
}

/** Persist + update the cache. */
export async function persistBengaliNumerals(value: boolean): Promise<void> {
  cached = value;
  try {
    await storage().setItem(NUMERALS_KEY, value ? "true" : "false");
  } catch {
    // Non-fatal — the choice just won't persist.
  }
}

export type NumeralsContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

export const NumeralsContext = createContext<NumeralsContextValue | null>(null);

export function useNumerals(): NumeralsContextValue {
  const ctx = useContext(NumeralsContext);
  if (!ctx) throw new Error("useNumerals must be used within a LocaleProvider");
  return ctx;
}
