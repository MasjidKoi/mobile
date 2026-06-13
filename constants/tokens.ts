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

export const fontFamily = {
  // Loaded via expo-font in app/_layout.tsx. Covers বাংলা + English.
  primary: "Hind Siliguri",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const fontSize = {
  micro: 11,
  caption: 13,
  body: 15,
  heading: 17,
  title: 22,
  display: 28,
} as const;

/** Named type ramp from the Style Guide (size + weight per role). */
export const typography = {
  display: { fontFamily: fontFamily.primary, fontSize: fontSize.display, fontWeight: fontWeight.bold },
  title: { fontFamily: fontFamily.primary, fontSize: fontSize.title, fontWeight: fontWeight.semibold },
  heading: { fontFamily: fontFamily.primary, fontSize: fontSize.heading, fontWeight: fontWeight.semibold },
  body: { fontFamily: fontFamily.primary, fontSize: fontSize.body, fontWeight: fontWeight.regular },
  caption: { fontFamily: fontFamily.primary, fontSize: fontSize.caption, fontWeight: fontWeight.medium },
  micro: { fontFamily: fontFamily.primary, fontSize: fontSize.micro, fontWeight: fontWeight.regular },
} as const;
