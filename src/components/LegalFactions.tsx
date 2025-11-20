import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Stethoscope, Scale } from "lucide-react";

export default function LegalFactions({ t }: { t: any }) {
  return (
    <section id="legal-factions" className="py-20 px-4 bg-[#12181F]">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.legalFactions.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.legalFactions.subtitle}</p>
        </div>

        <div className="flex flex-col gap-24">
          {/* Police - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#00C8FF] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(0,200,255,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00C8FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Shield className="h-32 w-32 text-[#00C8FF] drop-shadow-[0_0_15px_rgba(0,200,255,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#00C8FF] transition-colors duration-300">
                {t.legalFactions.police.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.police.description}
              </p>
            </div>
          </div>

          {/* EMS - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#FF3366] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(255,51,102,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-[#FF3366]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Stethoscope className="h-32 w-32 text-[#FF3366] drop-shadow-[0_0_15px_rgba(255,51,102,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#FF3366] transition-colors duration-300">
                {t.legalFactions.ems.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.ems.description}
              </p>
            </div>
          </div>

          {/* DOJ - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#FFD700] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Scale className="h-32 w-32 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#FFD700] transition-colors duration-300">
                {t.legalFactions.doj.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.doj.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
