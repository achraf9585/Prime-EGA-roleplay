import Image from "next/image";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import { Play } from "lucide-react";

export default function Header({ t }: { t: any }) {
  return (
    <>
      <nav className="relative overflow-hidden border-b border-[hsl(215_18%_20%)] bg-[#0b2032]/70 backdrop-blur-sm ">
        <div className="container mx-auto px-4 py-4 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/PRIME LOGO.png"
                alt="EGA Roleplay Logo"
                width={40}
                height={40}
                className="rounded-none drop-shadow-[0_0_18px_rgba(0,200,255,0.35)]"
                priority
              />
              <span className="text-sm sm:text-l font-bold text-white font-orbitron tracking-wider whitespace-nowrap">
                Prime EGA ROLEPLAY
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
                {t.navigation.features}
              </a>
              <a href="#server" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
                {t.navigation.server}
              </a>
              <a href="#how-to-play" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
                How to Play
              </a>
              <a href="#application" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
                Application
              </a>
              <a href="#rules" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
                Rules
              </a>
              <a href="#join" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors">
                {t.navigation.join}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] hover:from-[#1E90FF] hover:to-[#00C8FF] font-inter font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(0,200,255,0.35)] transition-all duration-300 hover:scale-105">
                <Play className="mr-2 h-4 w-4" />
                {t.navigation.connect}
              </Button>
              {/*
                   <div className="flex items-center space-x-2">
              <ThemeToggle />
              <SimpleLanguageSwitcher />
            </div>
            */}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] overflow-hidden bg-transparent">
          <div className="header-line" />
        </div>
      </nav>
    
    </>
  );
}
