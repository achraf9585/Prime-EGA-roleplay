import { Card, CardContent } from "@/components/ui/card";

export default function RulesSection({ t }: { t: any }) {
  return (
    <section id="rules" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.serverRules.title}</h2>
            <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.serverRules.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.serverRules.rules.map((rule: string, index: number) => (
              <Card key={index} className="bg-[#12181F] border-[hsl(215_18%_20%)]">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <p className="text-[hsl(220_15%_72%)]">{rule}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
