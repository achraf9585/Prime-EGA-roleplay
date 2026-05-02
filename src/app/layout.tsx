import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import SimpleLanguageSwitcher from "@/components/SimpleLanguageSwitcher";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EGA Roleplay - GTA V FiveM Roleplay Server",
  description:
    "Join EGA Roleplay, the most immersive GTA V FiveM roleplay server. Experience realistic roleplay, unique jobs, and an active community in Los Santos.",
  keywords: "GTA V, FiveM, Roleplay, Server, Los Santos, EGA Roleplay",
  authors: [{ name: "EGA Roleplay" }],
  openGraph: {
    title: "EGA Roleplay - GTA V FiveM Roleplay Server",
    description:
      "Join EGA Roleplay, the most immersive GTA V FiveM roleplay server. Experience realistic roleplay, unique jobs, and an active community in Los Santos.",
    type: "website",
  },
};

import TrafficTracker from "@/components/TrafficTracker";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
      >
        <AuthProvider>
          <TrafficTracker />
          <div className="fixed top-4 right-4 z-50">
            <SimpleLanguageSwitcher />
          </div>
          {children}
          <Analytics />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
