import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

import { NavigationColors, NavigationColorsDark } from "@/constants/theme";

/**
 * React Navigation theme for the active scheme, seeded from our tokens. Drives
 * the navigator's default background/card/text so route transitions and any
 * header chrome match the app palette in both light and dark.
 */
export function navThemeFor(isDark: boolean): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  const palette = isDark ? NavigationColorsDark : NavigationColors;
  return {
    ...base,
    colors: { ...base.colors, ...palette },
  };
}
