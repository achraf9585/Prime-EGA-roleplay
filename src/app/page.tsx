"use client";

import { useState, useEffect } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowToPlay from "@/components/HowToPlay";
import ServerInfo from "@/components/ServerInfo";
import ApplicationSection from "@/components/ApplicationSection";
import RulesSection from "@/components/RulesSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";
import LegalFactions from "@/components/LegalFactions";
import IllegalFactions from "@/components/IllegalFactions";
import AvailableJobs from "@/components/AvailableJobs";
import MembershipPricing from "@/components/MembershipPricing";
import RedeemSection from "@/components/RedeemSection";

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
    setT(translations[savedLanguage as keyof typeof translations]);
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a08] via-[#140f0b] to-[#140f0b] relative">
      <div className="pointer-events-none absolute inset-0 bg-orange-radials" />
      <Header t={t} />
      <section className="relative overflow-hidden min-h-[650px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-10 left-0 w-full h-[120%]">
            <iframe
              src="https://www.youtube.com/embed/ydz7Wss0PAk?autoplay=1&mute=1&controls=0&loop=1&playlist=ydz7Wss0PAk&modestbranding=1&showinfo=0&rel=0"
              title="EGA Roleplay Chapter 2 Trailer"
              className="w-full h-full pointer-events-none scale-110"
              allow="autoplay; fullscreen; encrypted-media"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/20 via-[#020817]/60 to-[#020817]/90" />
        </div>
        <div className="relative z-10">
          <Hero t={t} />
        </div>
      </section>
            <MembershipPricing t={t} />
      <RedeemSection t={t} />
      <Features t={t} />
      <LegalFactions t={t} />
      <IllegalFactions t={t} />
      <AvailableJobs t={t} />

      <HowToPlay t={t} />
     
      <RulesSection t={t} />
      <JoinSection t={t} />
      <Footer t={t} />
    </div>
  );
}
