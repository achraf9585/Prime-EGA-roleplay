import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthProvider from "@/components/AuthProvider";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${orbitron.variable} ${inter.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
