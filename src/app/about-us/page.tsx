"use client";

import { useState, useEffect } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutUs() {
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
    <div className="min-h-screen bg-[#1a0a08] text-white selection:bg-orange-500/30 font-inter">
        <Header t={t} />
        
        <main className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="relative px-4 py-20 md:py-32 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />
                {/* Abstract background elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 container mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-400 mb-6 backdrop-blur-sm">
                        Welcome to Season 2
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-orbitron tracking-wider mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        {t.aboutPage.title}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto rounded-full" />
                </div>
            </section>

            {/* Storyline Section */}
            <section className="container mx-auto px-4 mb-32 max-w-4xl">
                 <div className="bg-[#140f0b]/80 backdrop-blur-md border border-white/5 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-orange-500/20 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all duration-700" />
                    
                    <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        {t.aboutPage.storyline.title}
                    </h2>
                    <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
                        {t.aboutPage.storyline.description}
                    </p>
                 </div>
            </section>

            {/* Countries Section */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
                        {t.aboutPage.countries.title}
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Explore the three distinct regions that define our world.
                    </p>
                </div>
                
                <div className="space-y-24">
                    {/* Neo San Voro: Futuristic/Cyberpunk - Image Right */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700 opacity-60" />
                        <div className="relative bg-[#0f0f16]/90 border border-indigo-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden hover:border-indigo-500/40 transition-colors duration-500">
                             {/* Decorative Grid Background */}
                             <div className="absolute inset-0 z-0 opacity-10" 
                                style={{
                                    backgroundImage: `linear-gradient(indigo 1px, transparent 1px), linear-gradient(to right, indigo 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }}
                             />
                            
                            <div className="w-full md:w-1/2 z-10 text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm mb-6">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    Technology Hub
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold font-orbitron text-white mb-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                    {t.aboutPage.countries.neoSanVoro.title}
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-8 border-l-2 border-indigo-500/50 pl-6">
                                    {t.aboutPage.countries.neoSanVoro.description}
                                </p>
                            </div>
                            
                            {/* Visual Representation */}
                            <div className="w-full md:w-1/2 z-10 flex justify-center">
                                <div className="relative w-64 h-64 md:w-80 md:h-80">
                                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse blur-3xl" />
                                    <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 to-black rounded-2xl border border-indigo-500/40 transform rotate-3 hover:rotate-6 transition-transform duration-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                                    </div>
                                    {/* Small floating elements */}
                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#1a1a2e] rounded-xl border border-indigo-400/30 flex items-center justify-center animate-bounce delay-700">
                                        <span className="text-indigo-400 font-bold font-mono text-xs">AI-99</span>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 w-20 h-12 bg-[#1a1a2e] rounded-xl border border-purple-400/30 flex items-center justify-center animate-bounce delay-1000">
                                        <span className="text-purple-400 font-bold font-mono text-xs">CYBER</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The North: Rugged/Survival - Image Left */}
                    <div className="relative group">
                         <div className="absolute inset-0 bg-gradient-to-l from-cyan-900/20 to-slate-900/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700 opacity-60" />
                         <div className="relative bg-[#0b1116]/90 border border-cyan-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row-reverse items-center gap-12 overflow-hidden hover:border-cyan-500/40 transition-colors duration-500">
                             {/* Decorative Snow/Ice Background */}
                             <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
                            
                            <div className="w-full md:w-1/2 z-10 text-left md:text-right">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm mb-6 ml-auto">
                                    Unforgiving Wilderness
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold font-orbitron text-white mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    {t.aboutPage.countries.theNorth.title}
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-8 border-r-0 md:border-r-2 border-cyan-500/50 pr-0 md:pr-6">
                                     {t.aboutPage.countries.theNorth.description}
                                </p>
                            </div>

                             {/* Visual Representation */}
                             <div className="w-full md:w-1/2 z-10 flex justify-center">
                                <div className="relative w-64 h-64 md:w-80 md:h-80">
                                    <div className="absolute inset-0 bg-cyan-500/10 rounded-full animate-pulse blur-3xl" />
                                    <div className="relative w-full h-full bg-gradient-to-bl from-slate-800 to-cyan-950 rounded-[40px] border border-cyan-500/40 transform -rotate-3 hover:-rotate-6 transition-transform duration-500 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 text-cyan-100 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 3.32a1 1 0 0 1 .5.86v6.63a1 1 0 0 1-.5.86l-5.74 3.32a1 1 0 0 1-1 0l-5.74-3.32a1 1 0 0 1-.5-.86V6.87a1 1 0 0 1 .5-.86L12 2.69z"></path></svg>
                                    </div>
                                      {/* Small floating elements */}
                                      <div className="absolute top-0 left-8 w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-full border border-cyan-400/30 flex items-center justify-center animate-pulse">
                                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                     {/* Cayo Repuplica: Tropical/Dangerous - Image Right */}
                     <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700 opacity-60" />
                        <div className="relative bg-[#0c140c]/90 border border-emerald-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden hover:border-emerald-500/40 transition-colors duration-500">
                             {/* Decorative Pattern Background */}
                             <div className="absolute inset-0 z-0 opacity-10" 
                                style={{
                                    backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
                                    backgroundSize: '20px 20px'
                                }}
                             />
                            
                            <div className="w-full md:w-1/2 z-10 text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Tropical Danger
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold font-orbitron text-white mb-6 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                    {t.aboutPage.countries.cayo.title}
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-8 border-l-2 border-emerald-500/50 pl-6">
                                     {t.aboutPage.countries.cayo.description}
                                </p>
                            </div>
                            
                            {/* Visual Representation */}
                            <div className="w-full md:w-1/2 z-10 flex justify-center">
                                <div className="relative w-64 h-64 md:w-80 md:h-80">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse blur-3xl" />
                                    <div className="relative w-full h-full bg-gradient-to-t from-green-900 to-emerald-950 rounded-tr-[80px] rounded-bl-[80px] border border-emerald-500/40 transform rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M12 17V3"></path><path d="m8 7 8-4"></path><path d="M21 7.5c0 8-5.33 13-13 13"></path><path d="M3 7.5C3 15.5 8.33 20.5 16 20.5"></path></svg>
                                    </div>
                                    {/* Small floating elements */}
                                    <div className="absolute bottom-8 -right-4 w-16 h-16 bg-[#0c140c] rounded-full border border-emerald-400/30 flex items-center justify-center animate-bounce delay-500">
                                        <span className="text-2xl">🌴</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <Footer t={t} />
    </div>
  );
}
