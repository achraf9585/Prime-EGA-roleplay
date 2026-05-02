"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, Car, Home as HomeIcon, Briefcase, Heart } from "lucide-react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const FEATURES = [
  { Icon: Users, key: "activeCommunity" },
  { Icon: Shield, key: "professionalStaff" },
  { Icon: Car, key: "customVehicles" },
  { Icon: HomeIcon, key: "housingSystem" },
  { Icon: Briefcase, key: "uniqueJobs" },
  { Icon: Heart, key: "realisticEconomy" },
] as const;

export default function Features({ t }: { t: any }) {
  return (
    <section id="features" className="py-24 px-4 bg-[#0D0802]/60 relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.features.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">
            {t.features.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {FEATURES.map(({ Icon, key }) => (
            <motion.div key={key} variants={cardVariant}>
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="h-full"
              >
                <Card className="bg-[#120C04] border-[#2A1E0A] hover:border-[#C9A84C]/50 transition-colors duration-300 hover:shadow-[0_0_40px_rgba(201,168,76,0.13)] h-full group">
                  <CardHeader className="pb-4">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-[#1A1208] border border-[#C9A84C]/20 flex items-center justify-center mb-4 group-hover:border-[#C9A84C]/55 group-hover:bg-[#201509] transition-all duration-300"
                      whileHover={{ rotate: [0, -6, 6, 0] }}
                      transition={{ duration: 0.45 }}
                    >
                      <Icon className="h-7 w-7 text-[#C9A84C]" />
                    </motion.div>
                    <CardTitle className="text-white font-orbitron tracking-wide text-base">
                      {t.features[key].title}
                    </CardTitle>
                    <CardDescription className="text-[hsl(220_15%_63%)] font-inter leading-relaxed text-sm">
                      {t.features[key].description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
