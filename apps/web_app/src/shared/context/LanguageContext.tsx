import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n, { AppLanguage, getLanguage, normalizeLanguage, setLanguage as setI18nLanguage } from "../lib/i18n";

type LanguageCtx = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
};

const Ctx = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => getLanguage());

  useEffect(() => {
    void setI18nLanguage(language);
  }, [language]);

  // i18n 인스턴스가 초기화 안 된 경우 방어
  useEffect(() => {
    if (!i18n.isInitialized) {
      // side-effect import가 꼬였을 때 대비 (대부분 위 i18n.ts에서 해결됨)
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (lang: AppLanguage) => setLanguageState(normalizeLanguage(lang)),
    }),
    [language]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLanguage must be used within LanguageProvider");
  return v;
}
