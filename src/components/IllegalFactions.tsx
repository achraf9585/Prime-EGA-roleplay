"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface FactionRowProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  accentColor: string;
  reverse?: boolean;
}

function FactionRow({ imageSrc, imageAlt, title, description, accentColor, reverse = false }: FactionRowProps) {
  return (
    <motion.div
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-16`}
      initial={{ opacity: 0, x: reverse ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      {/* Image panel */}
      <div className="w-full md:w-1/2 relative h-[300px] rounded-2xl overflow-hidden border border-[#2A1E0A] bg-[#120C04]/90 group">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Image src={imageSrc} alt={imageAlt} fill className="object-contain" />
        </motion.div>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${accentColor}12 0%, transparent 65%)` }}
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1.5px ${accentColor}` }}
        />
      </div>

      {/* Text */}
      <div className={`w-full md:w-1/2 ${reverse ? "text-center md:text-right" : "text-center md:text-left"}`}>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-orbitron transition-colors duration-300 group/title">
          {title}
        </h3>
        <p className="text-lg text-[hsl(220_15%_65%)] leading-relaxed font-inter">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

const ILLEGAL_FACTIONS = [
  { img: "/illegal factions/logos/gambino.png", alt: "Gambino Crime Family", key: "gambino", accent: "#B45309", reverse: false },
  { img: "/illegal factions/logos/cartel.png", alt: "The Cartel", key: "cartel", accent: "#DC2626", reverse: true },
  { img: "/illegal factions/logos/commonwealth.png", alt: "The Commonwealth", key: "commonwealth", accent: "#14B8A6", reverse: false },
  { img: "/illegal factions/logos/lostmc.png", alt: "The Lost MC", key: "lostmc", accent: "#64748B", reverse: true },
  { img: "/illegal factions/logos/sonofanarchy.png", alt: "Sons of Anarchy MC", key: "sonofanarchy", accent: "#EA580C", reverse: false },
  { img: "/illegal factions/logos/ballas.png", alt: "Ballas", key: "ballas", accent: "#9333EA", reverse: true },
  { img: "/illegal factions/logos/vagos.png", alt: "Los Santos Vagos", key: "vagos", accent: "#EAB308", reverse: false },
  { img: "/illegal factions/logos/families.png", alt: "The Families", key: "gangs", accent: "#22C55E", reverse: true },
  { img: "/illegal factions/logos/marabunta.png", alt: "Marabunta Grande", key: "marabunta", accent: "#3B82F6", reverse: false },
  { img: "/illegal factions/logos/velocity.png", alt: "Velocity Crew", key: "velocity", accent: "#06B6D4", reverse: true },
  { img: "/illegal factions/logos/bloods.png", alt: "Bloods", key: "bloods", accent: "#71717A", reverse: false },
  { img: "/illegal factions/logos/neworder.png", alt: "The New Order", key: "newOrder", accent: "#6366F1", reverse: true },
  { img: "/illegal factions/logos/otf.png", alt: "OTF", key: "otf", accent: "#FBBF24", reverse: false },
  { img: "/illegal factions/logos/crips.png", alt: "Crips", key: "crips", accent: "#2563EB", reverse: true },
] as const;

export default function IllegalFactions({ t }: { t: any }) {
  return (
    <section id="illegal-factions" className="py-24 px-4 bg-[#0D0802] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.illegalFactions.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.illegalFactions.subtitle}</p>
        </motion.div>

        <div className="flex flex-col gap-24">
          {ILLEGAL_FACTIONS.map(({ img, alt, key, accent, reverse }) => (
            <FactionRow
              key={key}
              imageSrc={img}
              imageAlt={alt}
              title={t.illegalFactions[key]?.title ?? key}
              description={t.illegalFactions[key]?.description ?? ""}
              accentColor={accent}
              reverse={reverse}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
