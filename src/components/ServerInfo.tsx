import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServerInfo({ t }: { t: any }) {
  return (
    <section id="server" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.server.title}</h2>
            <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.server.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{t.server.details.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[hsl(220_15%_72%)]">{t.server.details.serverName}</span>
                  <span className="text-white font-semibold">{t.server.details.serverNameValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(220_15%_72%)]">{t.server.details.playersOnline}</span>
                  <span className="text-[#00C8FF] font-semibold">{t.server.details.playersOnlineValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(220_15%_72%)]">{t.server.details.uptime}</span>
                  <span className="text-white font-semibold">{t.server.details.uptimeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(220_15%_72%)]">{t.server.details.location}</span>
                  <span className="text-white font-semibold">{t.server.details.locationValue}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{t.server.quickStart.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[t.server.quickStart.step1, t.server.quickStart.step2, t.server.quickStart.step3, t.server.quickStart.step4].map((step: string, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00C8FF] to-[#1E90FF] flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-[hsl(220_15%_72%)]">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
