"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "tn", name: "تونسي", flag: "🇹🇳" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 border-slate-600 text-slate-300 hover:bg-slate-800"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <Globe className="h-4 w-4" />
      </Button>

      <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors flex items-center space-x-3 ${
                locale === language.code
                  ? "bg-slate-700 text-green-400"
                  : "text-slate-300"
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {locale === language.code && (
                <span className="ml-auto text-green-400">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
