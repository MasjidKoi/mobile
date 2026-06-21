import { I18nManager } from "react-native";

import { isRTLLanguage } from "@/lib/i18n";

/**
 * RTL plumbing. We `allowRTL` globally so right-to-left is available the moment
 * an Arabic build needs it, but we do NOT `forceRTL` here: that only takes
 * effect after an app restart (see the Phase 7 "Arabic Restart" screen). Bengali
 * and English are LTR, so nothing is forced today. Going forward, prefer logical
 * styles (`ms-`/`me-`, `start`/`end`) over physical `left`/`right`.
 */
export function initRTL(): void {
  try {
    I18nManager.allowRTL(true);
  } catch {
    // Non-fatal on platforms without the native module (e.g. web).
  }
}

/** Whether the layout is currently rendering right-to-left. */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

export { isRTLLanguage };
