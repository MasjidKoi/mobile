import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

import i18n, { isRTLLanguage } from "@/lib/i18n";
import { loadStoredLanguage } from "@/lib/i18n/language";
import {
  loadBengaliNumerals,
  NumeralsContext,
  persistBengaliNumerals,
  type NumeralsContextValue,
} from "@/lib/i18n/numerals";

/**
 * Applies the persisted language + Bengali-numerals preference before first
 * paint (PRD 09 #54), then provides the reactive numerals context. Renders
 * nothing until hydrated — the native splash is still up, so the gate is
 * invisible and the first frame is already in the right language/numerals.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [numerals, setNumerals] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await loadStoredLanguage();
      if (stored && stored !== i18n.language) {
        await i18n.changeLanguage(stored);
      }
      // Keep the native RTL flag in sync with the active language. Switching
      // away from Arabic via the in-place (bn⇄en) path leaves `isRTL` stuck
      // true, which mirrors the whole UI; reconcile so an LTR language never
      // renders right-to-left.
      const wantRTL = isRTLLanguage(stored ?? i18n.language);
      if (wantRTL !== I18nManager.isRTL) {
        try {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(wantRTL);
          await Updates.reloadAsync();
          return; // reloading to apply the new layout direction
        } catch {
          // Dev client may not support reloadAsync — the flag is set, so the
          // next launch starts in the correct direction.
        }
      }
      const num = await loadBengaliNumerals();
      if (active) {
        setNumerals(num);
        setHydrated(true);
      }
    })().catch(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setNumerals(value);
    void persistBengaliNumerals(value);
  }, []);

  const value = useMemo<NumeralsContextValue>(
    () => ({ enabled: numerals, setEnabled }),
    [numerals, setEnabled],
  );

  if (!hydrated) return null;

  return <NumeralsContext.Provider value={value}>{children}</NumeralsContext.Provider>;
}
