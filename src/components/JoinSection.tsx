import { Button } from "@/components/ui/button";
import { Play, Disc, Twitter, Youtube, Instagram } from "lucide-react";

export default function JoinSection({ t }: { t: any }) {
  return (
    <section id="join" className="py-20 px-4 bg-[#140f0b]/50">
      <div className="container mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">{t.join.title}</h2>
          <p className="text-xl text-[hsl(220_15%_72%)] mb-8 font-inter">{t.join.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
           <a href="fivem://connect/45.134.108.118:30120" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#fa5d3d] to-[#ff8c73] hover:from-[#ff8c73] hover:to-[#fa5d3d] text-lg px-8 py-6 font-inter font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(250,93,61,0.35)] transition-all duration-300 hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              {t.join.connectServer}
            </Button> 
            </a>
            <a href="https://discord.gg/DN68KscXch" target="_blank" rel="noopener noreferrer">
               <Button
              size="lg"
              variant="outline"
              className="border-[hsl(215_18%_20%)] text-[hsl(220_15%_72%)] hover:bg-[#12181F] hover:text-white text-lg px-8 py-6"
            >
              <Disc className="mr-2 h-5 w-5" />
              {t.join.joinDiscord}
            </Button>
            </a>
         
          </div>

          <div className="flex justify-center space-x-6">
            <a href="https://www.instagram.com/prime_roleplay_tn/" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="https://www.youtube.com/@ega_roleplay" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
              <Youtube className="h-6 w-6" />
            </a>
            <a href="https://discord.gg/sZsqsJFBBN" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
              <Disc className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
