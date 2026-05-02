"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Play, Users, Zap, ChevronDown, Disc } from "lucide-react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";

export default function Hero({ t }: { t: any }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const stats = [
    { Icon: Users, label: "Active Players", value: "500+" },
    { Icon: Zap, label: "Season", value: "3 LIVE" },
    { Icon: Star, label: "Uptime", value: "24/7" },
  ];

  const orbitParticles = [
    { cls: "logo-orbit-1", size: 9, color: "#a855f7", shadow: "rgba(168,85,247,0.9)" },
    { cls: "logo-orbit-2", size: 7, color: "#3b82f6", shadow: "rgba(59,130,246,0.8)" },
    { cls: "logo-orbit-3", size: 6, color: "#c084fc", shadow: "rgba(192,132,252,0.7)" },
    { cls: "logo-orbit-4", size: 5, color: "#60a5fa", shadow: "rgba(96,165,250,0.7)" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative h-screen py-16 md:py-20 px-4 overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0 pointer-events-none bg-vertical-purple-lines opacity-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#8b5cf6]/50 via-[#3b82f6]/30 to-[#8b5cf6]/50" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative container mx-auto z-10 w-full"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center gap-5"
        >
          {/* ── LOGO ── */}
          <motion.div variants={item}>
            <div
              className="logo-reveal relative flex items-center justify-center"
              style={{ width: 340, height: 340 }}
            >
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(59,130,246,0.08) 45%, transparent 68%)",
                }}
              />

              <svg
                className="logo-ring-cw absolute inset-0"
                width="340"
                height="340"
                viewBox="0 0 420 420"
                fill="none"
              >
                <circle cx="210" cy="210" r="204" stroke="url(#hgOuter)" strokeWidth="1.5"
                  strokeDasharray="18 6 4 6" strokeLinecap="round" opacity="0.7" />
                <circle cx="210" cy="210" r="204" stroke="url(#hgOuter)" strokeWidth="3"
                  strokeDasharray="4 60" strokeLinecap="round" opacity="0.9" />
                <defs>
                  <linearGradient id="hgOuter" x1="0" y1="0" x2="420" y2="420" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              <svg
                className="logo-ring-ccw absolute inset-0"
                width="340"
                height="340"
                viewBox="0 0 420 420"
                fill="none"
              >
                <circle cx="210" cy="210" r="176" stroke="url(#hgInner)" strokeWidth="1"
                  strokeDasharray="2 10" strokeLinecap="round" opacity="0.5" />
                <circle cx="210" cy="210" r="176" stroke="#8b5cf6" strokeWidth="2"
                  strokeDasharray="50 260" strokeLinecap="round" opacity="0.85" />
                <defs>
                  <linearGradient id="hgInner" x1="0" y1="0" x2="420" y2="420" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {orbitParticles.map(({ cls, size, color, shadow }) => (
                <div
                  key={cls}
                  className={`${cls} absolute`}
                  style={{ width: size, height: size, left: "50%", top: "50%", marginLeft: -size / 2, marginTop: -size / 2 }}
                >
                  <div style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size * 2}px ${size}px ${shadow}` }} />
                </div>
              ))}

              <div className="logo-breath relative rounded-full overflow-hidden z-10" style={{ width: 260, height: 260 }}>
                <Image
                  src="/logo.png"
                  alt="EGA Roleplay Logo"
                  width={480}
                  height={480}
                  className="object-contain w-full h-full"
                  priority
                />
                <div
                  className="logo-shimmer absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 30%, rgba(192,132,252,0.45) 50%, transparent 70%)" }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── BADGE ── */}
          <motion.div variants={item}>
            <Badge className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white font-semibold px-4 py-1.5 text-xs tracking-wider">
              <Star className="mr-1.5 h-3 w-3" />
              {t.hero.badge}
            </Badge>
          </motion.div>

          {/* ── TITLE ── */}
          <motion.h1
            variants={item}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-orbitron tracking-wide drop-shadow-[0_0_24px_rgba(139,92,246,0.45)]"
          >
            {t.hero.title}{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent font-orbitron">
              {t.hero.titleHighlight}
            </span>
          </motion.h1>

          {/* ── DESCRIPTION ── */}
          <motion.p
            variants={item}
            className="text-base md:text-lg text-[hsl(220_15%_72%)] max-w-2xl mx-auto font-inter leading-relaxed"
          >
            {t.hero.description}
          </motion.p>

          {/* ── STATS ── */}
          <motion.div
            variants={item}
            className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center"
          >
            {stats.map(({ Icon, label, value }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.06, y: -2 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0514]/90 border border-[#8b5cf6]/20 backdrop-blur-sm cursor-default"
              >
                <Icon className="w-4 h-4 text-[#a855f7] flex-shrink-0" />
                <span className="text-[#c084fc] font-bold font-orbitron text-sm">{value}</span>
                <span className="text-[hsl(220_15%_58%)] text-xs font-inter hidden sm:inline">{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-1"
          >
            <motion.a
              href="fivem://connect/45.134.108.118:30120"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Button className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#a855f7] hover:to-[#60a5fa] text-white font-bold font-orbitron tracking-wide px-9 py-6 text-sm sm:text-base shadow-[0_0_28px_rgba(139,92,246,0.35)] hover:shadow-[0_0_48px_rgba(168,85,247,0.55)] transition-shadow duration-300 border-0">
                <Play className="h-4 w-4 mr-2" />
                Play Now
              </Button>
            </motion.a>

            <motion.a
              href="https://discord.gg/DN68KscXch"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Button className="rounded-full bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/45 hover:border-[#5865F2]/80 text-white font-inter font-semibold px-9 py-6 text-sm sm:text-base transition-all duration-300 hover:shadow-[0_0_28px_rgba(88,101,242,0.30)]">
                <Disc className="h-4 w-4 mr-2" />
                Join Discord
              </Button>
            </motion.a>

            <motion.a
              href="https://www.youtube.com/watch?v=5inhwVQzYM4"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Button
                variant="ghost"
                className="rounded-full text-[hsl(220_15%_68%)] hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/25 px-9 py-6 text-sm sm:text-base font-inter transition-all duration-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Trailer
              </Button>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#8b5cf6]/45 pointer-events-none select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.9 }}
      >
        <span className="text-[10px] font-inter tracking-[0.25em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
