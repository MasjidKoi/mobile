/**
 * Typed access to the MasjidKoi design tokens for use outside of NativeWind
 * className strings — e.g. React Navigation themes, StatusBar, expo-image
 * placeholders, animated style values, or any `style={{ … }}` prop.
 *
 * Values come from constants/tokens.ts (the single source of truth shared with
 * tailwind.config.ts). Prefer className utilities (`bg-primary`, `text-body`)
 * in components; reach for these constants only where a className can't.
 */
import {
  colors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  lineHeight,
  typography,
} from "./tokens";

export const Colors = colors;
export const Spacing = spacing;
export const Radius = radius;
export const Fonts = fontFamily;
export const FontSize = fontSize;
export const LineHeight = lineHeight;
export const Typography = typography;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type TypographyToken = keyof typeof typography;

/** Drop-in palette for `@react-navigation` ThemeProvider. */
export const NavigationColors = {
  primary: colors.primary,
  background: colors.background,
  card: colors.surface,
  text: colors["text-primary"],
  border: colors.border,
  notification: colors.error,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  lineHeight,
  typography,
} as const;

export default theme;
