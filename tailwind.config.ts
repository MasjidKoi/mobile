import type { Config } from "tailwindcss";
import {
  colors,
  spacing,
  radius,
  fontFamily,
  fontSize,
  lineHeight,
  typography,
} from "./constants/tokens";

/** Tailwind expects string CSS values; tokens stay numeric for RN `style` use. */
const px = <T extends Record<string, number>>(scale: T): Record<keyof T, string> =>
  Object.fromEntries(
    Object.entries(scale).map(([k, v]) => [k, `${v}px`]),
  ) as Record<keyof T, string>;

/** `text-display` etc. set both size and line-height from the type ramp. */
const fontSizeScale = Object.fromEntries(
  (Object.keys(typography) as (keyof typeof typography)[]).map((role) => [
    role,
    [`${fontSize[role]}px`, `${lineHeight[role]}px`],
  ]),
) as Record<keyof typeof typography, [string, string]>;

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    // Weight is carried by the font family (RN selects custom-font weight by
    // family, not numeric weight), so the default font-weight utilities are
    // disabled to keep `font-semibold`/`font-bold` as family selectors.
    fontWeight: {},
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary,
          pressed: colors["primary-pressed"],
          soft: colors["primary-soft"],
        },
        accent: {
          gold: colors["accent-gold"],
          "gold-soft": colors["accent-gold-soft"],
        },
        error: {
          DEFAULT: colors.error,
          soft: colors["error-soft"],
        },
        background: colors.background,
        surface: {
          DEFAULT: colors.surface,
          inverse: colors["surface-inverse"],
          "inverse-raised": colors["surface-inverse-raised"],
        },
        border: colors.border,
        content: {
          primary: colors["text-primary"],
          secondary: colors["text-secondary"],
          muted: colors["text-muted"],
        },
        scrim: colors.scrim,
        control: { light: colors["control-light"] },
        overlay: colors["overlay-fill"],
        "on-inverse": {
          DEFAULT: colors["on-inverse"],
          muted: colors["on-inverse-muted"],
        },
      },
      spacing: px(spacing),
      borderRadius: px(radius),
      fontFamily: {
        primary: [fontFamily.primary],
        sans: [fontFamily.primary],
        regular: [fontFamily.regular],
        medium: [fontFamily.medium],
        semibold: [fontFamily.semibold],
        bold: [fontFamily.bold],
      },
      fontSize: fontSizeScale,
    },
  },
  plugins: [],
} satisfies Config;
