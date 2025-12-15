export type Language = "ko" | "en" | "ja";

export const SUPPORTED_LANGUAGES: Language[] = ["ko", "en", "ja"];

export const LANGUAGE_NAMES: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

const KEY = "pricebuddy_lang";

export function getLanguage(): Language {
  const v = (localStorage.getItem(KEY) || "ko") as Language;
  return SUPPORTED_LANGUAGES.includes(v) ? v : "ko";
}

export function setLanguage(lang: Language) {
  localStorage.setItem(KEY, lang);
}

export const translations: Record<Language, Record<string, string>> = {
  ko: {},
  en: {},
  ja: {},
};
