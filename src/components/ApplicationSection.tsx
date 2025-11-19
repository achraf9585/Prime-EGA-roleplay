import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApplicationSection({ t }: { t: any }) {
  return (
    <section id="application" className="py-20 px-4 bg-[#12181F]/50">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.rpApplication.title}</h2>
            <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.rpApplication.subtitle}</p>
          </div>

          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)]">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{t.rpApplication.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.characterName}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-[#0f2538] border border-[hsl(215_18%_20%)] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF] font-inter transition-all duration-300 hover:border-[#00C8FF] focus:shadow-[0_0_30px_rgba(0,200,255,0.2)]"
                    placeholder="Enter character name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.age}</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-[#0f2538] border border-[hsl(215_18%_20%)] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF] font-inter transition-all duration-300 hover:border-[#00C8FF] focus:shadow-[0_0_30px_rgba(0,200,255,0.2)]"
                    placeholder="Enter age"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.background}</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-[#0f2538] border border-[hsl(215_18%_20%)] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF]"
                  placeholder="Describe your character's background story..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(220_15%_72%)] mb-2">{t.rpApplication.form.experience}</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0f2538] border border-[hsl(215_18%_20%)] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF]"
                  placeholder="Tell us about your roleplay experience..."
                />
              </div>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] hover:from-[#1E90FF] hover:to-[#00C8FF] text-lg px-8 py-3 font-inter font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(0,200,255,0.35)] transition-all duration-300 hover:scale-105"
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
