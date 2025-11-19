"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";

type Language = "en" | "ar" | "tn";

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [t, setT] = useState(translations.en);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved language from localStorage only on client side
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["en", "ar", "tn"].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      setT(translations[savedLanguage]);
    }
  }, []);

  useEffect(() => {
    // Update translations when language changes
    setT(translations[currentLanguage]);
    if (isClient) {
      localStorage.setItem("language", currentLanguage);
    }
  }, [currentLanguage, isClient]);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setCurrentLanguage: handleLanguageChange,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
