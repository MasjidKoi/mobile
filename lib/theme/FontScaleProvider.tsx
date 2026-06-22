import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_FONT_STEP, isFontStep, type FontStep } from "./fontScale";

/** Persists across launches (fail-open, mirrors ThemeProvider). */
const STORAGE_KEY = "masjidkoi.fontStep.v1";

type FontScaleContextValue = {
  /** The user's stored in-app step. */
  step: FontStep;
  setStep: (step: FontStep) => void;
};

const FontScaleContext = createContext<FontScaleContextValue | null>(null);

export function useFontScale(): FontScaleContextValue {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error("useFontScale must be used within a FontScaleProvider");
  }
  return context;
}

/**
 * Holds the in-app font-size step, read from disk before first paint. Renders
 * nothing until hydrated so the very first frame already uses the chosen step
 * (PRD 09 #54) — the native splash is still up during that brief read, so the
 * gate is invisible. The OS font scale is read live by `Text` via
 * `useWindowDimensions().fontScale`; only the step is persisted here.
 */
export function FontScaleProvider({ children }: { children: ReactNode }) {
  const [step, setStepState] = useState<FontStep>(DEFAULT_FONT_STEP);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isFontStep(stored)) setStepState(stored);
      })
      .catch(() => {
        // Fail open — keep the default step.
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setStep = useCallback((next: FontStep) => {
    setStepState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Non-fatal — the choice just won't persist.
    });
  }, []);

  const value = useMemo<FontScaleContextValue>(() => ({ step, setStep }), [step, setStep]);

  if (!hydrated) return null;

  return <FontScaleContext.Provider value={value}>{children}</FontScaleContext.Provider>;
}
