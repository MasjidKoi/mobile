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
  micro: 16,
  caption: 18,
  body: 22,
  heading: 24,
  title: 28,
  display: 34,
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
