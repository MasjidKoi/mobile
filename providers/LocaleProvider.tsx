import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import i18n from "@/lib/i18n";
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
