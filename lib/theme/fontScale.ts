/**
 * FontScale — the pure logic behind the in-app text-size control (PRD 09 #11–15).
 *
 * Three in-app steps multiply the OS font scale under a combined cap, so the
 * two systems cooperate (a user with OS-large + in-app Extra-large doesn't blow
 * past a layout the screens can survive). No I/O — the provider owns persistence
 * and the OS scale comes from `useWindowDimensions().fontScale`.
 */

export type FontStep = "default" | "large" | "xlarge";

export const FONT_STEPS: readonly FontStep[] = ["default", "large", "xlarge"];

/** In-app multiplier per step (applied on top of the OS font scale). */
export const FONT_STEP_MULTIPLIER: Record<FontStep, number> = {
  default: 1,
  large: 1.15,
  xlarge: 1.3,
};

/** Combined (OS × in-app) ceiling — bounds the layout-audit burden. */
export const FONT_SCALE_CAP = 1.6;

export const DEFAULT_FONT_STEP: FontStep = "default";

export function isFontStep(value: unknown): value is FontStep {
  return typeof value === "string" && (FONT_STEPS as readonly string[]).includes(value);
}

/**
 * Effective multiplier to apply to a base font size: the in-app step times the
 * OS font scale, clamped to the cap. A non-positive/NaN OS scale falls back to 1.
 */
export function resolveFontScale(step: FontStep, osFontScale = 1): number {
  const os = Number.isFinite(osFontScale) && osFontScale > 0 ? osFontScale : 1;
  return Math.min(FONT_SCALE_CAP, FONT_STEP_MULTIPLIER[step] * os);
}
