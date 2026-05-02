"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function HowToPlay({ t }: { t: any }) {
  return (
    <section id="how-to-play" className="py-24 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-[#C9A84C]/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-[#C9A84C]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron tracking-wider">
              {t.howToPlay.title}
            </h2>
            <p className="text-xl text-[hsl(220_15%_72%)] font-inter">
              {t.howToPlay.subtitle}
            </p>
          </motion.div>

          {/* Steps grid with connector line on desktop */}
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* connecting line */}
            <div className="hidden md:block absolute top-[88px] left-[calc(16.6%+32px)] right-[calc(16.6%+32px)] h-px bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/40 to-[#C9A84C]/20 pointer-events-none" />

            {t.howToPlay.steps.map((step: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.14,
                  ease: "easeOut",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <Card className="bg-[#120C04] border-[#2A1E0A] hover:border-[#C9A84C]/55 transition-colors duration-300 hover:shadow-[0_0_40px_rgba(201,168,76,0.13)] relative overflow-hidden">
                    {/* Step badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A84C]/25 to-[#B8860B]/15 border border-[#C9A84C]/35 flex items-center justify-center">
                      <span className="text-[#C9A84C] text-xs font-bold font-orbitron">{index + 1}</span>
                    </div>

                    <CardContent className="p-8 text-center">
                      {/* Icon */}
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-[#1F1409] to-[#120C04] border border-[#C9A84C]/22 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        whileHover={{ rotate: 6, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <span className="text-4xl">{step.icon}</span>
                      </motion.div>

                      <h3 className="text-xl font-bold text-white mb-3 font-orbitron tracking-wide">
                        {step.title}
                      </h3>
                      <p className="text-[hsl(220_15%_63%)] leading-relaxed font-inter text-sm">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
