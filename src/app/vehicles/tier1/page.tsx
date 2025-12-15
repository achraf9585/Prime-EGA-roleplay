"use client";

import VehiclesGrid from "@/components/VehiclesGrid";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";

export default function Tier1VehiclesPage() {
  const [images, setImages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
    setT(translations[savedLanguage as keyof typeof translations]);

    // List of tier1 vehicle images
    const tier1Images = [
      "2020g900.PNG",
      "R34.PNG",
      "RS7.PNG",
      "c63w205.PNG",
      "cls2015.PNG",
      "e92.PNG",
      "gt3hycade.PNG",
      "lsterrato.PNG",
      "m3e46.PNG",
      "mercblackseries.PNG",
      "nisa31.PNG",
      "rmodmustang.PNG",
      "rmodsvj.PNG",
      "rmodx6.PNG",
      "urus.PNG"
    ];
    setImages(tier1Images);
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
        title="Premium Tier 1 Vehicles" 
        images={images} 
        category="tier1" 
      />
    </>
  );
}
