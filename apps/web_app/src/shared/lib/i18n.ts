export type Lang = "ko" | "en" | "ja";

export const DEFAULT_LANG: Lang = "ko";

export function t(key: string, lang: Lang = DEFAULT_LANG): string {
  const dict: Record<Lang, Record<string, string>> = {
    ko: {},
    en: {},
    ja: {},
  };
  return dict[lang]?.[key] ?? key;
}
