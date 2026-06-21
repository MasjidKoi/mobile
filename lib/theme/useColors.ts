import { Colors, ColorsDark, type ColorToken } from "@/constants/theme";

import { useTheme } from "./ThemeProvider";

/**
 * The active semantic color palette as raw hex values, for the few places a
 * NativeWind `className` can't reach — most notably icon `color` props
 * (`@expo/vector-icons`) and `style={{ … }}` values. Flips with dark mode so
 * icons stay theme-correct, unlike importing the static `Colors` directly.
 *
 *   const c = useColors();
 *   <Feather name="mail" color={c.primary} />
 */
export function useColors(): Record<ColorToken, string> {
  const { isDark } = useTheme();
  return isDark ? ColorsDark : Colors;
}
