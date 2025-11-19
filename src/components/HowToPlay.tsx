import { Card, CardContent } from "@/components/ui/card";

export default function HowToPlay({ t }: { t: any }) {
  return (
    <section id="how-to-play" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.howToPlay.title}</h2>
            <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.howToPlay.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.howToPlay.steps.map((step: any, index: number) => (
              <Card
                key={index}
                className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:scale-105 transition-all duration-300 hover:border-[#00C8FF] hover:shadow-[0_0_30px_rgba(0,200,255,0.2)]"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">{step.icon}</span>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron tracking-wide">{step.title}</h3>
                  <p className="text-[hsl(220_15%_72%)] leading-relaxed font-inter">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
