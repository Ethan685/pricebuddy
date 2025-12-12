import { useLanguage } from "@/shared/context/LanguageContext";
import { Language, LANGUAGE_NAMES } from "@/shared/lib/i18n";

export function LanguageSelector() {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
    >
      {supportedLanguages.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_NAMES[lang]}
        </option>
      ))}
    </select>
  );
}

