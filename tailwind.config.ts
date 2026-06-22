import type { Config } from "tailwindcss";
import {
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
      // Colors resolve to CSS variables so the ThemeProvider can flip the whole
      // palette light↔dark at runtime (lib/theme/vars.ts) without touching any
      // component's className. `:root` defaults live in global.css; the var name
      // is always `--color-<token-key>` from constants/tokens.ts.
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          pressed: "var(--color-primary-pressed)",
          soft: "var(--color-primary-soft)",
        },
        accent: {
          gold: "var(--color-accent-gold)",
          "gold-soft": "var(--color-accent-gold-soft)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          soft: "var(--color-error-soft)",
        },
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          inverse: "var(--color-surface-inverse)",
          "inverse-raised": "var(--color-surface-inverse-raised)",
        },
        border: "var(--color-border)",
        content: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        scrim: "var(--color-scrim)",
        control: { light: "var(--color-control-light)" },
        overlay: "var(--color-overlay-fill)",
        "on-inverse": {
          DEFAULT: "var(--color-on-inverse)",
          muted: "var(--color-on-inverse-muted)",
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
