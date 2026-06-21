/**
 * Receipt / annual-report PDFs. The backend serves them as Bearer-authenticated
 * binary streams, so we download with the access token attached, cache the file,
 * and hand it to the OS share/open sheet (no in-app PDF renderer).
 */
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { env } from "@/config/env";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getAccessToken } from "@/lib/auth/tokens";

async function downloadAndShare(path: string, filename: string): Promise<void> {
  const token = await getAccessToken();
  const dest = new File(Paths.cache, filename);
  try {
    if (dest.exists) dest.delete();
  } catch {
    // A stale cache file we can't remove is non-fatal — the download overwrites.
  }
  const file = await File.downloadFileAsync(`${env.apiBaseUrl}${path}`, dest, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
}

/** Download + share a single donation's receipt (completed donations only). */
export function shareReceipt(donationId: string): Promise<void> {
  return downloadAndShare(ENDPOINTS.donations.receipt(donationId), `receipt-${donationId}.pdf`);
}

/** Download + share the annual giving summary for a calendar year. */
export function shareAnnualReport(year: number): Promise<void> {
  return downloadAndShare(`${ENDPOINTS.me.annualReport}?year=${year}`, `giving-summary-${year}.pdf`);
}
