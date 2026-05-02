"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Users } from "lucide-react";

interface Family {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  created_at: string;
}

const ACCENT_COLORS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
];

export default function FamilySection({ t }: { t: any }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFamilies() {
      try {
        const { data, error } = await supabase
          .from("Family")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setFamilies(data);
        }
      } catch (err) {
        console.error("Failed to fetch families", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFamilies();
  }, []);

  if (loading || families.length === 0) return null;

  return (
    <section id="families" className="py-24 px-4 bg-[#0a0514] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t?.families?.title || "Active Families"}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">
            {t?.families?.subtitle || "The syndicates shaping the streets of Los Santos."}
          </p>
        </motion.div>

        <div className="flex flex-col gap-24">
          {families.map((family, index) => {
            const reverse = index % 2 !== 0;
            const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
            
            return (
              <motion.div
                key={family.id}
                className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-16`}
                initial={{ opacity: 0, x: reverse ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.75, ease: "easeOut" }}
              >
                {/* Image panel */}
                <div className="w-full md:w-1/2 relative h-[300px] rounded-2xl overflow-hidden border border-[#1a1a2e] bg-[#0d0d1a]/90 group shadow-2xl">
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center p-8"
                    whileHover={{ scale: 1.07 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  >
                    {family.logo ? (
                      <img 
                        src={family.logo} 
                        alt={family.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Users className="text-white/20 w-32 h-32" />
                    )}
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
                  <h3 
                    className="text-2xl md:text-3xl font-bold text-white mb-4 font-orbitron transition-colors duration-300 group-hover:text-transparent group-hover:bg-clip-text"
                    style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #ffffff)` }}
                  >
                    {family.name}
                  </h3>
                  <p className="text-lg text-[hsl(220_15%_65%)] leading-relaxed font-inter">
                    {family.description || "A secretive organization with unknown motives."}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
