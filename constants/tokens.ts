/**
 * MasjidKoi design tokens — single source of truth.
 *
 * Mirrors the "Style Guide" frame in design/mobile.pen. These raw values are
 * consumed by:
 *   - tailwind.config.ts  (NativeWind className utilities: bg-primary, p-md, …)
 *   - constants/theme.ts  (typed access from JS/TS: Colors, Spacing, …)
 *
 * Keep token names identical to the Pencil variables so the two stay in sync.
 */

export const colors = {
  primary: "#0E6B4F",
  "primary-pressed": "#0A523D",
  "primary-soft": "#E8F1EC",

  "accent-gold": "#B98E2F",
  "accent-gold-soft": "#F4EDDB",

  error: "#C2453E",
  "error-soft": "#F7E7E6",

  background: "#F7F8F6",
  surface: "#FFFFFF",
  "surface-inverse": "#10110F",
  "surface-inverse-raised": "#1C1E1A",
  border: "#E4E9E5",

  "text-primary": "#182420",
  "text-secondary": "#57645D",
  "text-muted": "#8C9690",

  scrim: "#182420B3",
  "control-light": "#FFFFFFEB",
  "overlay-fill": "#FFFFFF26",
  "on-inverse": "#FFFFFF",
  "on-inverse-muted": "#FFFFFF99",
} as const;

/**
 * Dark-mode palette — the SAME keys as `colors` (enforced by `satisfies`). The
 * ThemeProvider swaps these in as CSS variables at runtime (lib/theme/vars.ts),
 * so every existing `className` token (bg-surface, text-content-primary, …)
 * flips automatically with no per-component edits.
 *
 * Note the "inverse" tokens flip the other way: a dark-mode `surface-inverse`
 * is LIGHT (and `on-inverse` text becomes dark), preserving the inverted-card
 * contrast relationship the kit relies on.
 */
export const colorsDark = {
  primary: "#2EA37C",
  "primary-pressed": "#247F61",
  "primary-soft": "#14342A",

  "accent-gold": "#D8B25A",
  "accent-gold-soft": "#2A2410",

  error: "#E5675F",
  "error-soft": "#3A1F1D",

  background: "#0D0F0E",
  surface: "#161917",
  "surface-inverse": "#F2F4F1",
  "surface-inverse-raised": "#FFFFFF",
  border: "#2A2F2C",

  "text-primary": "#ECEFEC",
  "text-secondary": "#A7B0AB",
  "text-muted": "#79827D",

  scrim: "#000000B3",
  "control-light": "#1C1E1AEB",
  "overlay-fill": "#FFFFFF1A",
  "on-inverse": "#10110F",
  "on-inverse-muted": "#10110F99",
} as const satisfies Record<keyof typeof colors, string>;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

/**
 * Hind Siliguri (covers বাংলা + English). In React Native each weight is a
 * separate font family, selected by family name — not the `fontWeight` prop.
 * Names match the @expo-google-fonts/hind-siliguri exports loaded in
 * app/_layout.tsx. `primary` is the default body family.
 */
export const fontFamily = {
  primary: "HindSiliguri_400Regular",
  regular: "HindSiliguri_400Regular",
  medium: "HindSiliguri_500Medium",
  semibold: "HindSiliguri_600SemiBold",
  bold: "HindSiliguri_700Bold",
} as const;

export const fontSize = {
  micro: 11,
  caption: 13,
  body: 15,
  heading: 17,
  title: 22,
  display: 28,
} as const;

export const lineHeight = {
  // Leading is sized for Hind Siliguri's tall Bengali clusters (matra bar +
  // stacked vowel signs sit well above Latin cap height). Ratios below ~1.4×
  // make iOS center the glyph in the line box and clip the ascent — visible as
  // sheared tops on বাংলা headings while Latin text survives. Keep every entry
  // ≥ ~1.45× fontSize; `display`/`title` were the tight ones that clipped.
  micro: 16,
  caption: 18,
  body: 22,
  heading: 24,
  title: 32,
  display: 40,
} as const;

/**
 * Named type ramp from the Style Guide. Weight is carried by `fontFamily`
 * (RN selects custom-font weight by family, not the numeric `fontWeight`).
 */
export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: fontSize.display, lineHeight: lineHeight.display },
  title: { fontFamily: fontFamily.semibold, fontSize: fontSize.title, lineHeight: lineHeight.title },
  heading: { fontFamily: fontFamily.semibold, fontSize: fontSize.heading, lineHeight: lineHeight.heading },
  body: { fontFamily: fontFamily.regular, fontSize: fontSize.body, lineHeight: lineHeight.body },
  caption: { fontFamily: fontFamily.medium, fontSize: fontSize.caption, lineHeight: lineHeight.caption },
  micro: { fontFamily: fontFamily.regular, fontSize: fontSize.micro, lineHeight: lineHeight.micro },
} as const;
