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
      <div className="w-full md:w-1/2 relative h-[300px] rounded-2xl overflow-hidden border border-[#2A1E0A] group">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        </motion.div>

        {/* Hover color overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${accentColor}14 0%, transparent 65%)` }}
        />

        {/* Hover accent border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1.5px ${accentColor}` }}
        />

        {/* Glow behind card on hover */}
        <div
          className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `0 0 50px ${accentColor}28` }}
        />
      </div>

      {/* Text */}
      <div className={`w-full md:w-1/2 ${reverse ? "text-center md:text-right" : "text-center md:text-left"}`}>
        <h3
          className="text-2xl md:text-3xl font-bold text-white mb-4 font-orbitron transition-colors duration-300 group-hover:text-white"
          style={{ "--accent": accentColor } as React.CSSProperties}
        >
          {title}
        </h3>
        <p className="text-lg text-[hsl(220_15%_65%)] leading-relaxed font-inter">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

const FACTIONS = [
  { imageSrc: "/legal factions/goverment.png", imageAlt: "Government", key: "government", accentColor: "#4A90E2" },
  { imageSrc: "/legal factions/embassy.png", imageAlt: "Embassy", key: "embassy", accentColor: "#2ECC71", reverse: true },
  { imageSrc: "/legal factions/doj.png", imageAlt: "Department of Justice", key: "doj", accentColor: "#FFD700" },
  { imageSrc: "/legal factions/lspd.png", imageAlt: "LSPD Police", key: "lspd", accentColor: "#00C8FF", reverse: true },
  { imageSrc: "/legal factions/sheriff.png", imageAlt: "Sheriff Department", key: "sheriff", accentColor: "#D4A574" },
  { imageSrc: "/legal factions/ambulance_city.png", imageAlt: "Ambulance City", key: "ambulanceCity", accentColor: "#FF3366", reverse: true },
  { imageSrc: "/legal factions/journalist.jpg", imageAlt: "Journalist / News Agency", key: "journalist", accentColor: "#9B59B6" },
];

export default function LegalFactions({ t }: { t: any }) {
  return (
    <section id="factions" className="py-24 px-4 bg-[#0D0802] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#C9A84C]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.legalFactions.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.legalFactions.subtitle}</p>
        </motion.div>

        <div className="flex flex-col gap-24">
          {FACTIONS.map(({ imageSrc, imageAlt, key, accentColor, reverse }) => (
            <FactionRow
              key={key}
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              title={t.legalFactions[key].title}
              description={t.legalFactions[key].description}
              accentColor={accentColor}
              reverse={reverse}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
