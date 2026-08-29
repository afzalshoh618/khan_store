"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "uz" | "ru";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (uzText: string, ruText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "uz",
  setLang: () => {},
  t: (uzText) => uzText,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>("uz");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("khan_lang") as Language;
      if (savedLang === "uz" || savedLang === "ru") {
        setLangState(savedLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("khan_lang", newLang);
    }
  };

  const t = (uzText: string, ruText: string) => {
    return lang === "ru" ? ruText : uzText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center bg-bg-subtle p-0.5 rounded-lg border border-border-main text-xs font-semibold">
      <button
        onClick={() => setLang("uz")}
        className={`px-2 py-0.5 rounded-md transition-all ${
          lang === "uz"
            ? "bg-accent-main text-accent-fg shadow-xs font-bold"
            : "text-text-muted hover:text-text-main"
        }`}
      >
        UZ
      </button>
      <button
        onClick={() => setLang("ru")}
        className={`px-2 py-0.5 rounded-md transition-all ${
          lang === "ru"
            ? "bg-accent-main text-accent-fg shadow-xs font-bold"
            : "text-text-muted hover:text-text-main"
        }`}
      >
        RU
      </button>
    </div>
  );
};
