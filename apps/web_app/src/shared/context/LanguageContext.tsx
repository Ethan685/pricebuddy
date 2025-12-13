import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { Language, getLanguage, setLanguage as setLang, translations, SUPPORTED_LANGUAGES } from "../lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  supportedLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  const handleSetLanguage = (lang: Language) => {
    setLang(lang);
    setLanguageState(lang);
    document.documentElement.lang = lang;
  };

  // 현재 언어에 맞는 t 함수 생성
  const t = useMemo(() => {
    return (key: string): string => {
      return translations[language]?.[key] || translations.ko[key] || key;
    };
  }, [language]);

  // 초기 언어 설정
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

