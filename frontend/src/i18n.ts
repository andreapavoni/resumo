import en from "./locales/en.js";
import it from "./locales/it.js";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "En" },
  { code: "it", label: "It" },
] as const;

// Locale type is derived from SUPPORTED_LOCALES — no manual sync needed when adding languages
export type Locale = (typeof SUPPORTED_LOCALES)[number]["code"];

let currentLocale: Locale = "en";

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

const translations: Record<Locale, Record<string, string>> = { en, it };

export function t(key: string): string {
  return translations[currentLocale]?.[key]
    ?? translations["en"]?.[key]
    ?? key;
}
