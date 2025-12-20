import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { SUPPORTED_LANGUAGES, type AppLanguage } from "../lib/i18n";

const LABEL: Record<AppLanguage, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as AppLanguage)}
      aria-label="Language"
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <option key={lng} value={lng}>
          {LABEL[lng]}
        </option>
      ))}
    </select>
  );
}
