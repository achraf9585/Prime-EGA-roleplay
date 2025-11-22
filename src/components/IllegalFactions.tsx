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

          
          {/* Gambino Crime Family - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-amber-900/30 flex items-center justify-center group-hover:border-amber-700 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(180,83,9,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/gambino.jpg" 
                  alt="Gambino Crime Family" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-amber-600 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
               <Image src="/illegal factions/logos/gambino.png" alt="Gambino Logo" width={180} height={180} className="object-contain" />

                <span>{t.illegalFactions.gambino.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.gambino.description}
              </p>
            </div>
          </div>

               {/* The Cartel - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
     
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-red-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/cartel.png" alt="Cartel Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.cartel.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.cartel.description}
              </p>
            </div>

                   <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-red-900/30 flex items-center justify-center group-hover:border-red-600 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(220,38,38,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/cartel.jpg" 
                  alt="The Cartel" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

                 {/* The Lost MC - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-slate-600/30 flex items-center justify-center group-hover:border-slate-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(100,116,139,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/lostmc.jpg" 
                  alt="The Lost MC" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-slate-400 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/lostmc.png" alt="Lost MC Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.lostmc.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.lostmc.description}
              </p>
            </div>
          </div>

              {/* Sons of Anarchy MC - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-orange-600/30 flex items-center justify-center group-hover:border-orange-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(234,88,12,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/sonofanarchy.jpg" 
                  alt="Sons of Anarchy MC" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-orange-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/sonofanarchy.png" alt="Sons of Anarchy Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.sonofanarchy.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.sonofanarchy.description}
              </p>
            </div>
          </div>

             {/* Ballas - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
       
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-purple-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/ballas.png" alt="Ballas Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.ballas.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.ballas.description}
              </p>
            </div>
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
          </div>

             {/* Vagos - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
       
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-yellow-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/vagos.png" alt="Vagos Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.vagos.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.vagos.description}
              </p>
            </div>
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
          </div>


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
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-green-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/families.png" alt="Families Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.gangs.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.gangs.description}
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
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-blue-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/marabunta.png" alt="Marabunta Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.marabunta.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.marabunta.description}
              </p>
            </div>
          </div>


          {/* Velocity Crew - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
     
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-cyan-500 transition-colors duration-300 flex items-center justify-center md:justify-start gap-3">
                <Image src="/illegal factions/logos/velocity.png" alt="Velocity Logo" width={180} height={180} className="object-contain" />
                <span>{t.illegalFactions.velocity.title}</span>
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.illegalFactions.velocity.description}
              </p>
            </div>
                   <div className="w-full md:w-1/2 relative h-[300px] bg-[#121212] rounded-2xl border border-cyan-600/30 flex items-center justify-center group-hover:border-cyan-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(8,145,178,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/illegal factions/velocity.jpg" 
                  alt="Velocity Crew" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>     
        </div>
      </div>
    </section>
  );
}
