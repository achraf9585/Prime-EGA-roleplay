"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import { Play, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export default function Header({ t }: { t: any }) {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      <nav className="relative z-50 border-b border-[hsl(215_18%_20%)] bg-[#0b2032]/70 backdrop-blur-sm ">
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
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5865F2] to-[#7289DA] animate-pulse" />
              ) : session ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#5865F2] hover:border-[#7289DA] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(88,101,242,0.5)]">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt="Discord Avatar"
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      )}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b2032]" />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0b2032] border border-[#5865F2]/30 rounded-lg shadow-[0_0_30px_rgba(88,101,242,0.2)] z-[9999] overflow-hidden">
                      <div className="p-3 border-b border-[#5865F2]/20">
                        <p className="text-white font-semibold text-sm truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-[hsl(220_15%_72%)] text-xs">
                          Connected via Discord
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          signOut();
                        }}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => signIn("discord")}
                  className="bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:from-[#7289DA] hover:to-[#5865F2] font-inter font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(88,101,242,0.35)] transition-all duration-300 hover:scale-105"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Connect with Discord
                </Button>
              )}
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
