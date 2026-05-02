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

    // List of tier1 vehicle images
    const tier1Images = [
      "bdragon.png",
      "bnr34.png",
      "c63w.png",
      "cls.png",
      "demon.png",
      "e46.png",
      "e92_new.png",
      "f40lb.png",
      "gt3rs.png",
      "isserto.png",
      "m3g80.png",
      "m8c.png",
      "nisa31_new.png",
      "rmodmustang_new.png",
      "rmodsvj_new.png",
      "rs7_new.png"
    ];
    setImages(tier1Images);
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
