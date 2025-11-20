import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Car, Video, Package } from "lucide-react";

export default function AvailableJobs({ t }: { t: any }) {
  return (
    <section id="available-jobs" className="py-20 px-4 bg-[#12181F]/50">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.availableJobs.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.availableJobs.subtitle}</p>
        </div>

        <div className="flex flex-col gap-24">
          {/* Mechanic - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#12181F] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-green-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Wrench className="h-32 w-32 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-green-500 transition-colors duration-300">
                {t.availableJobs.mechanic.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.availableJobs.mechanic.description}
              </p>
            </div>
          </div>

          {/* Taxi - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#12181F] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-yellow-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Car className="h-32 w-32 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-yellow-500 transition-colors duration-300">
                {t.availableJobs.taxi.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.availableJobs.taxi.description}
              </p>
            </div>
          </div>

          {/* Reporter - Left Image, Right Text */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#12181F] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-purple-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Video className="h-32 w-32 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-purple-500 transition-colors duration-300">
                {t.availableJobs.reporter.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.availableJobs.reporter.description}
              </p>
            </div>
          </div>

          {/* Delivery - Right Image, Left Text */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
            <div className="w-full md:w-1/2 relative h-[300px] bg-[#12181F] rounded-2xl border border-[hsl(215_18%_20%)] flex items-center justify-center group-hover:border-orange-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(249,115,22,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Package className="h-32 w-32 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-right">
              <h3 className="text-3xl font-bold text-white mb-4 font-orbitron group-hover:text-orange-500 transition-colors duration-300">
                {t.availableJobs.delivery.title}
              </h3>
              <p className="text-lg text-[hsl(220_15%_72%)] leading-relaxed font-inter">
                {t.availableJobs.delivery.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
