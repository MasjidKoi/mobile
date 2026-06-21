import { vars } from "nativewind";

import { colors, colorsDark } from "@/constants/tokens";

/**
 * Build a NativeWind `vars()` style object from a token palette. Each token key
 * becomes the `--color-<key>` variable that tailwind.config.ts references, so
 * applying the returned style to a wrapper View re-themes every descendant's
 * `className` colors at once.
 */
function toVars(palette: Record<string, string>) {
  const entries: Record<string, string> = {};
  for (const [key, value] of Object.entries(palette)) {
    entries[`--color-${key}`] = value;
  }
  return vars(entries);
}

export const lightVars = toVars(colors);
export const darkVars = toVars(colorsDark);

/** The `--color-*` variable map for the active color scheme. */
export function themeVars(isDark: boolean) {
  return isDark ? darkVars : lightVars;
}
