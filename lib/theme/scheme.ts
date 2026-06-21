import type { ColorSchemePreference } from "./ThemeProvider";

/**
 * Pure resolution of (stored preference, OS scheme) → the dark/light scheme in
 * effect. Extracted so the mapping is unit-testable independent of React.
 *   - "system" follows the OS (`null`/unknown → light).
 *   - "light"/"dark" force their scheme regardless of the OS.
 */
export function resolveDarkScheme(
  preference: ColorSchemePreference,
  systemScheme: "light" | "dark" | null | undefined,
): boolean {
  if (preference === "system") return systemScheme === "dark";
  return preference === "dark";
}
