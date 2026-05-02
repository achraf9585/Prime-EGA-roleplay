import Image from "next/image";

export default function Footer({ t }: { t: any }) {
  return (
    <footer className="border-t border-[#2A1E0A] bg-[#0A0700] py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Image src="/new_ega_logo.png" alt="EGA Roleplay Logo" width={32} height={32} className="rounded-none drop-shadow-[0_0_10px_rgba(201,168,76,0.4)]" />
          <span className="text-xl font-bold text-white">Prime EGA Roleplay</span>
        </div>
        <p className="text-slate-400">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
