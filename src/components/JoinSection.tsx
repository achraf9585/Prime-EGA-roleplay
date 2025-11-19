import { Button } from "@/components/ui/button";
import { Play, Disc, Twitter, Youtube } from "lucide-react";

export default function JoinSection({ t }: { t: any }) {
  return (
    <section id="join" className="py-20 px-4 bg-[#12181F]/50">
      <div className="container mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">{t.join.title}</h2>
          <p className="text-xl text-[hsl(220_15%_72%)] mb-8 font-inter">{t.join.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] hover:from-[#1E90FF] hover:to-[#00C8FF] text-lg px-8 py-6 font-inter font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(0,200,255,0.35)] transition-all duration-300 hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              {t.join.connectServer}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[hsl(215_18%_20%)] text-[hsl(220_15%_72%)] hover:bg-[#12181F] hover:text-white text-lg px-8 py-6"
            >
              <Disc className="mr-2 h-5 w-5" />
              {t.join.joinDiscord}
            </Button>
          </div>

          <div className="flex justify-center space-x-6">
            <a href="#" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
              <Youtube className="h-6 w-6" />
            </a>
            <a href="#" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
              <Disc className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
