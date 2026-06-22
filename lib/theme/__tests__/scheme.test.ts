import { resolveDarkScheme } from "../scheme";

describe("resolveDarkScheme", () => {
  it("follows the OS when preference is 'system'", () => {
    expect(resolveDarkScheme("system", "dark")).toBe(true);
    expect(resolveDarkScheme("system", "light")).toBe(false);
  });

  it("treats unknown OS scheme as light under 'system'", () => {
    expect(resolveDarkScheme("system", null)).toBe(false);
    expect(resolveDarkScheme("system", undefined)).toBe(false);
  });

  it("forces the chosen scheme regardless of the OS", () => {
    expect(resolveDarkScheme("dark", "light")).toBe(true);
    expect(resolveDarkScheme("dark", null)).toBe(true);
    expect(resolveDarkScheme("light", "dark")).toBe(false);
  });
});
