import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { colorScheme as nativewindColorScheme } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme, View } from "react-native";

import { navThemeFor } from "./navTheme";
import { resolveDarkScheme } from "./scheme";
import { themeVars } from "./vars";

export type ColorSchemePreference = "system" | "light" | "dark";

/** Persists across launches (fail-open, mirrors lib/onboarding.ts). */
const STORAGE_KEY = "masjidkoi.theme.scheme.v1";

type ThemeContextValue = {
  /** The user's stored choice. */
  preference: ColorSchemePreference;
  /** The resolved scheme actually in effect (after applying "system"). */
  isDark: boolean;
  setPreference: (preference: ColorSchemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [preference, setPreferenceState] = useState<ColorSchemePreference>("system");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate the stored preference once on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && (stored === "system" || stored === "light" || stored === "dark")) {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        // Fail open — keep the "system" default.
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Reveal the app only once the persisted theme is applied, so the first
  // painted frame already uses the correct palette (no light↔dark flash). The
  // splash is held by RootLayout until fonts + this hydration both complete.
  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {
        // Non-fatal — splash may already be hidden.
      });
    }
  }, [hydrated]);

  const isDark = resolveDarkScheme(preference, systemScheme);

  // Keep NativeWind's own `dark:` variant in sync with our preference.
  useEffect(() => {
    nativewindColorScheme.set(preference);
  }, [preference]);

  const setPreference = useCallback((next: ColorSchemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Non-fatal — the choice just won't persist.
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, isDark, setPreference }),
    [preference, isDark, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <NavThemeProvider value={navThemeFor(isDark)}>
        <View style={[{ flex: 1 }, themeVars(isDark)]}>
          <StatusBar style={isDark ? "light" : "dark"} />
          {children}
        </View>
      </NavThemeProvider>
    </ThemeContext.Provider>
  );
}
