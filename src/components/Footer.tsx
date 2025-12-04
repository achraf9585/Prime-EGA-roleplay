import Image from "next/image";

export default function Footer({ t }: { t: any }) {
  return (
    <footer className="border-t border-[hsl(215_18%_20%)] bg-[#0b2032] py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Image src="/PRIME LOGO.png" alt="EGA Roleplay Logo" width={24} height={24} className="rounded-none" />
          <span className="text-xl font-bold text-white">Prime EGA Roleplay</span>
        </div>
        <p className="text-slate-400">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
