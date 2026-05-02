"use client";

import { useState, useEffect } from "react";
import { translations } from "@/components/SimpleLanguageSwitcher";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutUs() {
  const [t, setT] = useState(translations.en);

  return (
    <div className="min-h-screen bg-[#0a0514] text-white selection:bg-purple-500/30 font-inter">
        <Header t={t} />
        
        <main className="pt-24 pb-20">
            {/* Hero Section */}
            <section className="relative px-4 py-20 md:py-32 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />
                {/* Abstract background elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 container mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm font-bold text-purple-400 mb-6 backdrop-blur-sm uppercase tracking-widest">
                        Welcome to Season 3
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold font-orbitron tracking-wider mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                        {t?.aboutPage?.title || translations.en.aboutPage.title}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto rounded-full" />
                </div>
            </section>

            {/* Storyline Section */}
            <section className="container mx-auto px-4 mb-32 max-w-4xl">
                 <div className="bg-[#0f0a1a]/80 backdrop-blur-md border border-white/5 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700" />
                    
                    <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        {(t?.aboutPage || translations.en.aboutPage).storyline.title}
                    </h2>
                    {(t?.aboutPage || translations.en.aboutPage).storyline.intro ? (
                        <div className="space-y-10">
                            <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light border-l-2 border-purple-500/50 pl-6">
                                {(t?.aboutPage || translations.en.aboutPage).storyline.intro}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {(t?.aboutPage || translations.en.aboutPage).storyline.features.map((feature: any, index: number) => (
                                    <div key={index} className="bg-[#120a22] p-6 rounded-xl border border-purple-500/10 hover:border-blue-500/30 transition-colors flex flex-col group/feature">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl group-hover/feature:bg-blue-500/20 transition-colors">
                                                {feature.icon}
                                            </div>
                                            <h3 className="text-purple-400 font-bold tracking-widest uppercase text-xs">{feature.title}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
                            {(t?.aboutPage || translations.en.aboutPage).storyline.description}
                        </p>
                    )}
                 </div>
            </section>

        </main>

        <Footer t={t} />
    </div>
  );
}
