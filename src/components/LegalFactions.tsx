import Image from "next/image";

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
          {/* Government - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#4A90E2] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(74,144,226,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/goverment.png" 
                  alt="Government" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#4A90E2] transition-colors duration-300">
                {t.legalFactions.government.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.government.description}
              </p>
            </div>
          </div>

          {/* Embassy - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#2ECC71] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(46,204,113,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-[#2ECC71]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/embassy.png" 
                  alt="Embassy" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#2ECC71] transition-colors duration-300">
                {t.legalFactions.embassy.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.embassy.description}
              </p>
            </div>
          </div>

          {/* DOJ - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#FFD700] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
      <Image 
                  src="/legal factions/doj.jpg" 
                  alt="Department of Justice" 
                  fill
                  className="object-cover"
                />              </div>
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

          {/* LSPD Police - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#00C8FF] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(0,200,255,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-[#00C8FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/lspd.jpg" 
                  alt="LSPD Police" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#00C8FF] transition-colors duration-300">
                {t.legalFactions.lspd.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.lspd.description}
              </p>
            </div>
          </div>

          {/* Sheriff Department - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#D4A574] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(212,165,116,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/sheriff.jpg" 
                  alt="Sheriff Department" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#D4A574] transition-colors duration-300">
                {t.legalFactions.sheriff.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.sheriff.description}
              </p>
            </div>
          </div>

          {/* Ambulance City - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#FF3366] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(255,51,102,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-[#FF3366]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/ambulance_city.jpg" 
                  alt="Ambulance City" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#FF3366] transition-colors duration-300">
                {t.legalFactions.ambulanceCity.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.ambulanceCity.description}
              </p>
            </div>
          </div>

          {/* Ambulance North Side - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#E74C3C] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(231,76,60,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E74C3C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/ambulance_north.jpg" 
                  alt="Ambulance North Side" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#E74C3C] transition-colors duration-300">
                {t.legalFactions.ambulanceNorth.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.ambulanceNorth.description}
              </p>
            </div>
          </div>

          {/* Ambulance Cayo Perico - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#1ABC9C] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(26,188,156,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-[#1ABC9C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/ambulance_cayo.jpg" 
                  alt="Ambulance Cayo Perico" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#1ABC9C] transition-colors duration-300">
                {t.legalFactions.ambulanceCayo.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.ambulanceCayo.description}
              </p>
            </div>
          </div>

          {/* Journalist - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#081B2B] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-[#9B59B6] transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(155,89,182,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9B59B6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full transform group-hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/legal factions/journalist.jpg" 
                  alt="Journalist / News Agency" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-[#9B59B6] transition-colors duration-300">
                {t.legalFactions.journalist.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.legalFactions.journalist.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
