/**
 * Intro / onboarding carousel content + the photo-overlay treatment shared by
 * every intro slide.
 *
 * Slide COPY (kicker / title / body) now lives in i18n under
 * `onboarding.slides.<key>.*` (see lib/i18n/locales) so it localizes; only the
 * stable key + background photo stay here. Mirrors the "01 Intro …" frames in
 * design/mobile.pen.
 *
 * The brand-green scrim colours below are intro-screen decoration (a legibility
 * wash over full-bleed photography), not part of the global design-token set —
 * so they are kept local to this feature rather than added to constants/tokens.
 */
import type { ImageSourcePropType } from "react-native";

export type IntroSlideMeta = {
  /** Stable key — analytics id and the i18n lookup key for this slide's copy. */
  key: string;
  /** Full-bleed background photo. */
  image: ImageSourcePropType;
};

export const INTRO_SLIDES: IntroSlideMeta[] = [
  { key: "find-masjid", image: require("../assets/images/onboarding/intro-find-masjid.png") },
  { key: "prayer-times", image: require("../assets/images/onboarding/intro-prayer-times.png") },
  { key: "qibla", image: require("../assets/images/onboarding/intro-qibla.png") },
  { key: "donate", image: require("../assets/images/onboarding/intro-donate.png") },
];

/**
 * The intro photo-overlay palette. `base` is the frame fill behind the photo;
 * the two scrims are vertical gradients that darken the top (for status-bar
 * legibility) and the bottom (so white headline text reads over any photo).
 * Stops are `[color, position]` pairs matching the .pen gradient nodes.
 */
export const INTRO_SCRIM = {
  base: "#06150F",
  topScrim: {
    colors: ["#03100B80", "#03100B00"] as const,
    locations: [0, 1] as const,
  },
  bottomScrim: {
    colors: ["#06150F00", "#06150F00", "#06150FB3", "#041009"] as const,
    locations: [0, 0.34, 0.66, 1] as const,
  },
} as const;
