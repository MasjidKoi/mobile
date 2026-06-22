/**
 * Data export (PRD 09 #36–37). The backend streams a PDPO data-portability JSON
 * with the Bearer token attached; we download it to the cache and hand it to the
 * OS share sheet — same pattern as the donation receipts.
 */
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { env } from "@/config/env";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getAccessToken } from "@/lib/auth/tokens";

export async function exportMyData(): Promise<void> {
  const token = await getAccessToken();
  const dest = new File(Paths.cache, "masjidkoi-export.json");
  try {
    if (dest.exists) dest.delete();
  } catch {
    // A stale cache file we can't remove is non-fatal — the download overwrites.
  }
  const file = await File.downloadFileAsync(
    `${env.apiBaseUrl}${ENDPOINTS.users.export}`,
    dest,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!(await Sharing.isAvailableAsync())) {
    // Surface as a failure rather than a silent no-op so the caller shows the
    // retry/error state instead of a phantom "done".
    throw new Error("Sharing is not available on this device");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
  });
}
