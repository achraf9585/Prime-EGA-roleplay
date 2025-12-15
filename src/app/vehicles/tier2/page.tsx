"use client";

import VehiclesGrid from "@/components/VehiclesGrid";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";

export default function Tier2VehiclesPage() {
  const [images, setImages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
    setT(translations[savedLanguage as keyof typeof translations]);

    // List of tier2 vehicle images
    const tier2Images = [
      "190ASAP.PNG",
      "22M5.PNG",
      "500ew124.PNG",
      "DBLexushycade.PNG",
      "Hycaders6.PNG",
      "divo.PNG",
      "fk8hr.PNG",
      "giulia_2021.PNG",
      "gwopdemon.PNG",
      "mbslr.PNG",
      "rbmwm3f80.PNG",
      "rmod240sx.PNG",
      "rmodbacalar.PNG",
      "rmodm3e36.PNG",
      "rsq8m.PNG"
    ];
    setImages(tier2Images);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail.language;
      setCurrentLanguage(newLanguage);
      setT(translations[newLanguage as keyof typeof translations]);
    };

    window.addEventListener(
      "languageChanged",
      handleLanguageChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "languageChanged",
        handleLanguageChange as EventListener
      );
  }, []);

  return (
    <>
      <Header t={t} />
      <VehiclesGrid 
        title="Exclusive Tier 2 Vehicles" 
        images={images} 
        category="tier2" 
      />
    </>
  );
}
