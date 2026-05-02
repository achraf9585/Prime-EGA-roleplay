import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApplicationSection({ t }: { t: any }) {
  return (
    <section id="application" className="py-20 px-4 bg-[#140f0b]/50">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.rpApplication.title}</h2>
            <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.rpApplication.subtitle}</p>
          </div>

          <Card className="bg-[#120C04] border-[#2A1E0A]">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{t.rpApplication.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.characterName}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[#180E04] border border-[#2A1E0A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60 font-inter transition-all duration-300 hover:border-[#C9A84C]/40 focus:shadow-[0_0_25px_rgba(201,168,76,0.2)]"
                    placeholder="Enter character name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.age}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[#180E04] border border-[#2A1E0A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60 font-inter transition-all duration-300 hover:border-[#C9A84C]/40 focus:shadow-[0_0_25px_rgba(201,168,76,0.2)]"
                    placeholder="Enter age"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.background}</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-[#180E04] border border-[#2A1E0A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
                  placeholder="Describe your character's background story..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.experience}</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-[#180E04] border border-[#2A1E0A] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/60"
                  placeholder="Tell us about your roleplay experience..."
                />
              </div>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#C9A84C] to-[#B8860B] hover:from-[#FFD700] hover:to-[#C9A84C] text-[#0F0A04] text-lg px-8 py-3 font-inter font-bold tracking-wide hover:shadow-[0_0_30px_rgba(201,168,76,0.40)] transition-all duration-300 hover:scale-105"
                >
                  {t.rpApplication.form.submit}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
