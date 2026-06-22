import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import bn from "./locales/bn.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGUAGES = ["bn", "en", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Bengali is the hard default and fallback for any unsupported device locale. */
export const DEFAULT_LANGUAGE: AppLanguage = "bn";

/** Languages that render right-to-left. */
export const RTL_LANGUAGES: readonly AppLanguage[] = ["ar"];

function isSupported(code: string | null | undefined): code is AppLanguage {
  return !!code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

/** Pick the first supported device language; fall back to Bengali. */
function detectLanguage(): AppLanguage {
  const match = getLocales().find((locale) => isSupported(locale.languageCode));
  return match ? (match.languageCode as AppLanguage) : DEFAULT_LANGUAGE;
}

export function isRTLLanguage(language: string): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(language);
}

if (!i18n.isInitialized) {
  // i18next's canonical init chain; the default-export `.use` is intended here.
  // eslint-disable-next-line import/no-named-as-default-member
  void i18n.use(initReactI18next).init({
    resources: {
      bn: { translation: bn },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: detectLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18n;
