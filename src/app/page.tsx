"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { translations } from "@/components/SimpleLanguageSwitcher";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowToPlay from "@/components/HowToPlay";
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

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
    setT(translations[savedLanguage as keyof typeof translations]);
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail.language;
      setCurrentLanguage(newLanguage);
      setT(translations[newLanguage as keyof typeof translations]);
    };

    window.addEventListener("languageChanged", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChanged", handleLanguageChange as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0514] via-[#0f0724] to-[#0a0514] relative">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#8b5cf6] z-[200] origin-left"
        style={{ scaleX }}
      />

      <div className="pointer-events-none absolute inset-0 bg-purple-radials" />
      <Header t={t} />

      {/* Hero with video backdrop */}
      <section className="relative overflow-hidden min-h-[650px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/banner.png"
              alt="EGA Roleplay Hero Banner"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0514]/20 via-[#0a0514]/60 to-[#0a0514]/92" />
        </div>
        <div className="relative z-10">
          <Hero t={t} />
        </div>
      </section>

      <MembershipPricing t={t} />
      <RedeemSection t={t} />
      <Features t={t} />
      {/* <LegalFactions t={t} />
      <IllegalFactions t={t} />
      <AvailableJobs t={t} /> */}
      <HowToPlay t={t} />
      <RulesSection t={t} />
      <JoinSection t={t} />
      <Footer t={t} />
    </div>
  );
}
