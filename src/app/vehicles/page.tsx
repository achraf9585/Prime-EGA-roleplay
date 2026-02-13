"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, Crown, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";

export default function VehiclesPage() {
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

  const tiers = [
    {
      id: "tier1",
      name: "Tier 1 Vehicles",
      description: "Premium collection of 16 exclusive vehicles",
      icon: Crown,
      color: "#FFD700",
      gradient: "from-[#FFD700] to-[#FFA500]",
      count: 16,
      link: "/vehicles/tier1"
    },
    {
      id: "tier2",
      name: "Tier 2 Vehicles",
      description: "Elite collection of 22 high-performance vehicles",
      icon: Gem,
      color: "#CD7F32",
      gradient: "from-[#CD7F32] to-[#8B5A2B]",
      count: 22,
      link: "/vehicles/tier2"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a08] via-[#140f0b] to-[#140f0b] relative">
      <Header t={t} />
      <div className="py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-vertical-orange-lines opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-orange-radials opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <Car className="h-16 w-16 text-[#fa5d3d]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fa5d3d] to-white">
            Vehicle Collections
          </h1>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter max-w-2xl mx-auto">
            Explore our exclusive vehicle collections. Choose your tier and discover premium rides.
          </p>
          <div className="h-1 w-24 bg-[#fa5d3d] mx-auto rounded-full mt-6 animate-pulse" />
        </motion.div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Link href={tier.link}>
                  <Card className="group overflow-hidden bg-[#1a0a08]/70 border-2 backdrop-blur-sm hover:border-[#fa5d3d] transition-all duration-300 hover:shadow-[0_0_40px_rgba(250,93,61,0.3)] h-full cursor-pointer"
                    style={{ borderColor: `${tier.color}40` }}
                  >
                    <CardContent className="p-8 relative">
                      {/* Background Gradient */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                          <div 
                            className="p-4 rounded-full transition-transform duration-300 group-hover:scale-110"
                            style={{ 
                              backgroundColor: `${tier.color}20`,
                              boxShadow: `0 0 20px ${tier.color}40`
                            }}
                          >
                            <Icon 
                              className="h-12 w-12" 
                              style={{ color: tier.color }}
                            />
                          </div>
                        </div>

                        {/* Title */}
                        <h2 
                          className="text-3xl font-bold mb-3 font-orbitron text-center"
                          style={{ color: tier.color }}
                        >
                          {tier.name}
                        </h2>

                        {/* Description */}
                        <p className="text-[hsl(220_15%_72%)] text-center mb-6">
                          {tier.description}
                        </p>

                        {/* Vehicle Count */}
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Car className="h-5 w-5" style={{ color: tier.color }} />
                          <span className="font-semibold">{tier.count} Vehicles</span>
                        </div>

                        {/* View Button */}
                        <div className="mt-6 text-center">
                          <span 
                            className="inline-block px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 group-hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${tier.color}, ${tier.color}CC)`,
                              boxShadow: `0 4px 15px ${tier.color}40`
                            }}
                          >
                            View Collection →
                          </span>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`
                        }}
                      />
                      <div 
                        className="absolute bottom-0 left-0 w-full h-1"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`
                        }}
                      />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link 
            href="/"
            className="text-[#fa5d3d] hover:text-white transition-colors duration-300 font-semibold"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
