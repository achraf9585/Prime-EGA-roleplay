import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Car, Home as HomeIcon, Briefcase, Heart } from "lucide-react";

export default function Features({ t }: { t: any }) {
  return (
    <section id="features" className="py-20 px-4 bg-[#12181F]/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.features.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.features.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
            <CardHeader>
              <Users className="h-12 w-12 text-[#00C8FF] mb-4" />
              <CardTitle className="text-white">{t.features.activeCommunity.title}</CardTitle>
              <CardDescription className="text-[hsl(220_15%_72%)]">{t.features.activeCommunity.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
            <CardHeader>
              <Shield className="h-12 w-12 text-[#00C8FF] mb-4" />
              <CardTitle className="text-white">{t.features.professionalStaff.title}</CardTitle>
              <CardDescription className="text-[hsl(220_15%_72%)]">{t.features.professionalStaff.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
            <CardHeader>
              <Car className="h-12 w-12 text-[#00C8FF] mb-4" />
              <CardTitle className="text-white">{t.features.customVehicles.title}</CardTitle>
              <CardDescription className="text-[hsl(220_15%_72%)]">{t.features.customVehicles.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
            <CardHeader>
              <HomeIcon className="h-12 w-12 text-[#00C8FF] mb-4" />
              <CardTitle className="text-white">{t.features.housingSystem.title}</CardTitle>
              <CardDescription className="text-[hsl(220_15%_72%)]">{t.features.housingSystem.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-[#00C8FF] mb-4" />
              <CardTitle className="text-white">{t.features.uniqueJobs.title}</CardTitle>
              <CardDescription className="text-[hsl(220_15%_72%)]">{t.features.uniqueJobs.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#12181F] border-[hsl(215_18%_20%)] hover:border-[#00C8FF] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.2)] hover:scale-105">
            <CardHeader>
              <Heart className="h-12 w-12 text-[#00C8FF] mb-4" />
              <CardTitle className="text-white">{t.features.realisticEconomy.title}</CardTitle>
              <CardDescription className="text-[hsl(220_15%_72%)]">{t.features.realisticEconomy.description}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
