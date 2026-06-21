import {
  formatCurrency,
  formatNumber,
  formatTime,
  toBengaliDigits,
  toLatinDigits,
} from "../format";

const hasBengali = (s: string) => /[০-৯]/.test(s);
const hasWestern = (s: string) => /[0-9]/.test(s);

describe("digit mappers", () => {
  it("round-trips between Bengali and Western digits", () => {
    expect(toBengaliDigits("12:30")).toBe("১২:৩০");
    expect(toLatinDigits("১২:৩০")).toBe("12:30");
    expect(toBengaliDigits(toLatinDigits("৫,৪৩২"))).toBe("৫,৪৩২");
  });

  it("is idempotent on already-correct digits", () => {
    expect(toLatinDigits("12:30")).toBe("12:30");
    expect(toBengaliDigits("১২:৩০")).toBe("১২:৩০");
  });
});

describe("formatNumber numerals toggle", () => {
  it("uses Bengali digits for bn only when the toggle is on", () => {
    expect(hasBengali(formatNumber(1284, "bn", true))).toBe(true);
    expect(hasBengali(formatNumber(1284, "bn", true))).toBe(true);
  });

  it("uses Western digits for bn when the toggle is off (PRD default)", () => {
    const off = formatNumber(1284, "bn", false);
    expect(hasWestern(off)).toBe(true);
    expect(hasBengali(off)).toBe(false);
  });

  it("never converts English/Arabic regardless of the toggle", () => {
    expect(hasBengali(formatNumber(1284, "en", true))).toBe(false);
    expect(hasBengali(formatNumber(1284, "en", false))).toBe(false);
  });
});

describe("formatCurrency numerals toggle", () => {
  it("keeps the ৳ symbol and flips digit system for bn", () => {
    const on = formatCurrency(12500, "bn", true);
    const off = formatCurrency(12500, "bn", false);
    expect(on).toContain("৳");
    expect(hasBengali(on)).toBe(true);
    expect(hasBengali(off)).toBe(false);
    expect(hasWestern(off)).toBe(true);
  });
});

describe("formatTime numerals toggle", () => {
  const noon = new Date(2026, 0, 1, 12, 30);
  it("flips digit system for bn, passthrough for en", () => {
    expect(hasBengali(formatTime(noon, "bn", true))).toBe(true);
    expect(hasBengali(formatTime(noon, "bn", false))).toBe(false);
    expect(hasBengali(formatTime(noon, "en", true))).toBe(false);
  });
});
