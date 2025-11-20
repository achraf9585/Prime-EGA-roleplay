import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skull, DollarSign, Crosshair } from "lucide-react";

export default function IllegalFactions({ t }: { t: any }) {
  return (
    <section id="illegal-factions" className="py-20 px-4 bg-[#080B10] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-[#080B10] to-[#080B10] pointer-events-none" />
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.illegalFactions.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.illegalFactions.subtitle}</p>
        </div>

        <div className="flex flex-col gap-24">
          {/* The Families - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-green-600/30 flex items-center justify-center group-hover:border-green-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/families.jpg" 
                  alt="The Families" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-green-500 transition-colors duration-300">
                {t.illegalFactions.gangs.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.gangs.description}
              </p>
            </div>
          </div>

          {/* Ballas - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-purple-900/30 flex items-center justify-center group-hover:border-purple-600 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(147,51,234,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/ballas.jpg" 
                  alt="Ballas" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-purple-500 transition-colors duration-300">
                {t.illegalFactions.ballas.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.ballas.description}
              </p>
            </div>
          </div>

          {/* Vagos - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-yellow-600/30 flex items-center justify-center group-hover:border-yellow-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/vagos.jpg" 
                  alt="Los Santos Vagos" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-yellow-500 transition-colors duration-300">
                {t.illegalFactions.vagos.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.vagos.description}
              </p>
            </div>
          </div>

          {/* Marabunta Grande - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-blue-600/30 flex items-center justify-center group-hover:border-blue-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(37,99,235,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/marabunta.jpg" 
                  alt="Marabunta Grande" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-blue-500 transition-colors duration-300">
                {t.illegalFactions.marabunta.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.marabunta.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
