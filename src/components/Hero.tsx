import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Play, Disc, Users } from "lucide-react";

export default function Hero({ t }: { t: any }) {
  return (
    <section className="relative h-screen py-16 md:py-20 px-4 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none bg-vertical-cyan-lines opacity-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#00C8FF]/40 via-transparent to-[#00C8FF]/40" />

      {/* --- LEFT IMAGE (Bottom Left) --- */}
      <div className="hidden md:block absolute bottom-0 left-0 w-[35vw] h-[70vh] lg:h-[90vh] animate-float z-0 pointer-events-none">
        <Image
          src="/char/luth.png"
          alt="Character left"
          fill
          className="object-contain object-bottom drop-shadow-[0_0_50px_rgba(0,200,255,0.55)]"
        />
      </div>

      {/* --- RIGHT IMAGE (Bottom Right) --- */}
      <div className="hidden md:block absolute bottom-0 right-0 w-[35vw] h-[70vh] lg:h-[90vh]  animate-float-delayed z-0 pointer-events-none">
        <Image
          src="/char/eve.png"
          alt="Character right"
          fill
          // Added scale-x-[-1] to flip the image horizontally so it faces the content
          className="object-contain object-bottom drop-shadow-[0_0_50px_rgba(0,200,255,0.55)] scale-x-[-1]"
        />
      </div>

      <div className="relative container mx-auto flex flex-col items-center  justify-center gap-4 max-w-4xl z-10">
        {/* --- CENTER CONTENT --- */}
        <div className="w-full text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/PRIME LOGO.png"
              alt="EGA Roleplay Logo"
              width={220}
              height={220}
              className="animate-pulse-glow rounded-full drop-shadow-[0_0_30px_rgba(0,200,255,0.35)]"
              priority
            />
          </div>
          <Badge className="mb-4 bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] text-white">
            <Star className="mr-1 h-3 w-3" />
            {t.hero.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-orbitron tracking-wider drop-shadow-[0_0_15px_rgba(0,200,255,0.5)]">
            {t.hero.title}{" "}
            <span className="bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] bg-clip-text text-transparent font-orbitron drop-shadow-none">
              {t.hero.titleHighlight}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[hsl(220_15%_72%)] mb-6 max-w-2xl mx-auto font-inter">
            {t.hero.description}
          </p>

          {/* Video Trailer Call-to-Action */}
          <div className="max-w-xl mx-auto mt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-base md:text-lg font-orbitron text-white tracking-wide">
              Season 2 Trailer
            </span>
            <a
              href="https://www.youtube.com/watch?v=EQ2TthZ2k84"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="relative overflow-hidden rounded-full bg-[#1F2933]/90 hover:bg-[#00C8FF] hover:text-black transition-all duration-300 px-8 py-6 text-sm sm:text-base flex items-center gap-2 border border-white/10 shadow-[0_0_20px_rgba(0,200,255,0.2)] hover:shadow-[0_0_40px_rgba(0,200,255,0.6)] group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Play className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Watch Now!</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
