/**
 * Exempt-reason store. The server only ever sees an ambiguous `is_protected`
 * flag on a journal entry — it cannot tell an exemption (menstruation, travel,
 * illness…) apart from an auto-applied freeze. The *reason* is private and
 * stays on-device, in the keychain via expo-secure-store (never sent to the
 * server). Keyed by ISO date. Fails open like `lib/auth/tokens.ts`.
 */
import * as SecureStore from "expo-secure-store";

const KEY = "mkoi_exempt_reasons";

export const EXEMPT_REASONS = [
  "menstruation",
  "postpartum",
  "travel",
  "illness",
  "other",
] as const;
export type ExemptReason = (typeof EXEMPT_REASONS)[number];

type ExemptMap = Record<string, ExemptReason>;

export async function getExemptReasons(): Promise<ExemptMap> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as ExemptMap) : {};
  } catch {
    return {};
  }
}

async function persist(map: ExemptMap): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(map));
  } catch {
    // Non-fatal — the server still has the protected flag; only the local
    // reason annotation is lost.
  }
}

/** Mark a set of ISO dates as exempt with a shared reason. */
export async function setExemptRange(dates: string[], reason: ExemptReason): Promise<ExemptMap> {
  const map = await getExemptReasons();
  for (const d of dates) map[d] = reason;
  await persist(map);
  return map;
}

/** Remove the local reason for a set of dates (does not touch the server flag). */
export async function clearExemptDates(dates: string[]): Promise<ExemptMap> {
  const map = await getExemptReasons();
  for (const d of dates) delete map[d];
  await persist(map);
  return map;
}
