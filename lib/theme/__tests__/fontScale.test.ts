import {
  FONT_SCALE_CAP,
  FONT_STEP_MULTIPLIER,
  isFontStep,
  resolveFontScale,
} from "../fontScale";

describe("resolveFontScale", () => {
  it("applies the in-app step against a neutral OS scale", () => {
    expect(resolveFontScale("default", 1)).toBe(1);
    expect(resolveFontScale("large", 1)).toBeCloseTo(1.15);
    expect(resolveFontScale("xlarge", 1)).toBeCloseTo(1.3);
  });

  it("multiplies the OS font scale on top of the step", () => {
    expect(resolveFontScale("default", 1.2)).toBeCloseTo(1.2);
    expect(resolveFontScale("large", 1.2)).toBeCloseTo(1.15 * 1.2);
  });

  it("clamps the combined multiplier to the cap", () => {
    expect(resolveFontScale("xlarge", 2)).toBe(FONT_SCALE_CAP);
    expect(resolveFontScale("large", 1.6)).toBe(FONT_SCALE_CAP);
    expect(resolveFontScale("default", 3)).toBe(FONT_SCALE_CAP);
  });

  it("falls back to a neutral OS scale on bad input", () => {
    expect(resolveFontScale("default", 0)).toBe(1);
    expect(resolveFontScale("default", -1)).toBe(1);
    expect(resolveFontScale("default", Number.NaN)).toBe(1);
    expect(resolveFontScale("large")).toBeCloseTo(FONT_STEP_MULTIPLIER.large);
  });

  it("never exceeds the cap for any step at any OS scale", () => {
    for (const step of ["default", "large", "xlarge"] as const) {
      for (const os of [0.85, 1, 1.3, 1.6, 2.5]) {
        expect(resolveFontScale(step, os)).toBeLessThanOrEqual(FONT_SCALE_CAP);
      }
    }
  });
});

describe("isFontStep", () => {
  it("accepts the three steps and rejects anything else", () => {
    expect(isFontStep("default")).toBe(true);
    expect(isFontStep("large")).toBe(true);
    expect(isFontStep("xlarge")).toBe(true);
    expect(isFontStep("huge")).toBe(false);
    expect(isFontStep(null)).toBe(false);
    expect(isFontStep(2)).toBe(false);
  });
});
