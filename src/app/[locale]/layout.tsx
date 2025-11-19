import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Use a loose type here to stay compatible with next-intl's LayoutProps
  params: any;
}) {
  const locale = (params as { locale: string }).locale;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="scroll-smooth"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
