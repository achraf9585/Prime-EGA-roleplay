"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Disc, Youtube, Instagram } from "lucide-react";

const Tiktok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68l.06.27a6.32 6.32 0 006.26 5.86 6.32 6.32 0 006.26-6.32V10.2a8.23 8.23 0 005 1.63V8.38a4.83 4.83 0 01-3.03-1.69z" />
  </svg>
);

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const SOCIALS = [
  { href: "https://www.instagram.com/ega_roleplay_tn/", Icon: Instagram, label: "Instagram" },
  { href: "https://www.youtube.com/@EGAMES_ARENA", Icon: Youtube, label: "YouTube" },
  { href: "https://www.tiktok.com/@ega.roleplay", Icon: Tiktok, label: "Tiktok" },
];

export default function JoinSection({ t }: { t: any }) {
  return (
    <section id="join" className="py-28 px-4 bg-[#0a0514] relative overflow-hidden">
      {/* Layered ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[220px] bg-[#3b82f6]/4 rounded-full blur-2xl" />
      </div>

      {/* Animated top border */}
      <div className="absolute top-0 left-0 w-full h-px overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8b5cf6]/65 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col items-center gap-6"
          >
            {/* Decorative divider */}
            <motion.div variants={item} className="flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#8b5cf6]/45" />
              <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#8b5cf6]/45" />
            </motion.div>

            <motion.h2
              variants={item}
              className="text-4xl md:text-5xl font-bold text-white font-orbitron tracking-wider"
            >
              {t.join.title}
            </motion.h2>

            <motion.p
              variants={item}
              className="text-xl text-[hsl(220_15%_72%)] font-inter leading-relaxed"
            >
              {t.join.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-2"
            >
              <motion.a
                href="fivem://connect/45.134.108.118:30120"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  size="lg"
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#8b5cf6] text-[#0a0514] text-lg px-10 py-6 font-orbitron font-bold tracking-wide shadow-[0_0_32px_rgba(139,92,246,0.28)] hover:shadow-[0_0_54px_rgba(59,130,246,0.50)] transition-shadow duration-300 border-0"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {t.join.connectServer}
                </Button>
              </motion.a>

              <motion.a
                href="https://discord.gg/DN68KscXch"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  size="lg"
                  className="rounded-full bg-[#5865F2]/12 hover:bg-[#5865F2]/22 border border-[#5865F2]/38 hover:border-[#5865F2]/75 text-white text-lg px-10 py-6 font-inter font-semibold transition-all duration-300 hover:shadow-[0_0_32px_rgba(88,101,242,0.28)]"
                >
                  <Tiktok className="mr-2 h-5 w-5" />
                  {t.join.joinDiscord}
                </Button>
              </motion.a>
            </motion.div>

            {/* Social icons */}
            <motion.div variants={item} className="flex justify-center gap-3 mt-2">
              {SOCIALS.map(({ href, Icon, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full bg-[#0f0724] border border-[#1a103c] hover:border-[#8b5cf6]/45 flex items-center justify-center text-[hsl(220_15%_60%)] hover:text-[#8b5cf6] transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.18, y: -3 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
