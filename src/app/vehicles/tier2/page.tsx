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
      "240sx.png",
      "GODzBMWS1000RR.png",
      "cbr650rr.png",
      "darkfate.png",
      "f80.png",
      "fk8.png",
      "h2.png",
      "kmr1000rr.png",
      "m3kean.png",
      "m5.png",
      "mk7.png",
      "peptos.png",
      "rmodcharger.png",
      "rmode36.png",
      "rr01.png",
      "rs6.png",
      "rsq8.png",
      "s1000rr.png",
      "urus.png",
      "z8r.png",
      "zx10r.png",
      "zx6r.png"
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
