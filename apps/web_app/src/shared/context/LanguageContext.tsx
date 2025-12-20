import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import i18n, { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../lib/i18n";
import type { Language } from "../lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  supported: readonly Language[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, _setLanguage] = useState<Language>(() => {
    const saved = (localStorage.getItem("pricebuddy_lang") || "") as Language;
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(saved) ? saved : DEFAULT_LANGUAGE;
  });

  const setLanguage = (lang: Language) => {
    _setLanguage(lang);
    localStorage.setItem("pricebuddy_lang", lang);
    i18n.changeLanguage(lang);
  };

  const value = useMemo<LanguageContextValue>(() => {
    return { language, setLanguage, supported: SUPPORTED_LANGUAGES };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}
