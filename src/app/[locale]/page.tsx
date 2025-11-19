import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Shield,
  Car,
  Home as HomeIcon,
  Briefcase,
  Heart,
  Star,
  Play,
  Disc,
  Twitter,
  Youtube,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-green-500"></div>
              <span className="text-2xl font-bold text-white">
                EGA Roleplay
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-slate-300 hover:text-white transition-colors"
              >
                {t("navigation.features")}
              </a>
              <a
                href="#server"
                className="text-slate-300 hover:text-white transition-colors"
              >
                {t("navigation.server")}
              </a>
              <a
                href="#join"
                className="text-slate-300 hover:text-white transition-colors"
              >
                {t("navigation.join")}
              </a>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" />
              {t("navigation.connect")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-green-600 text-white">
              <Star className="mr-1 h-3 w-3" />
              {t("hero.badge")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {t("hero.title")}{" "}
              <span className="text-green-400">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                {t("hero.joinServer")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
              >
                <Disc className="mr-2 h-5 w-5" />
                {t("hero.joinDiscord")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t("features.title")}
            </h2>
            <p className="text-xl text-slate-300">{t("features.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Users className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">
                  {t("features.activeCommunity.title")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {t("features.activeCommunity.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">
                  {t("features.professionalStaff.title")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {t("features.professionalStaff.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Car className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">
                  {t("features.customVehicles.title")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {t("features.customVehicles.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <HomeIcon className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">
                  {t("features.housingSystem.title")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {t("features.housingSystem.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Briefcase className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">
                  {t("features.uniqueJobs.title")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {t("features.uniqueJobs.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Heart className="h-12 w-12 text-green-400 mb-4" />
                <CardTitle className="text-white">
                  {t("features.realisticEconomy.title")}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {t("features.realisticEconomy.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Server Info Section */}
      <section id="server" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                {t("server.title")}
              </h2>
              <p className="text-xl text-slate-300">{t("server.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">
                    {t("server.details.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">
                      {t("server.details.serverName")}
                    </span>
                    <span className="text-white font-semibold">
                      {t("server.details.serverNameValue")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">
                      {t("server.details.playersOnline")}
                    </span>
                    <span className="text-green-400 font-semibold">
                      {t("server.details.playersOnlineValue")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">
                      {t("server.details.uptime")}
                    </span>
                    <span className="text-white font-semibold">
                      {t("server.details.uptimeValue")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">
                      {t("server.details.location")}
                    </span>
                    <span className="text-white font-semibold">
                      {t("server.details.locationValue")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">
                    {t("server.quickStart.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span className="text-slate-300">
                      {t("server.quickStart.step1")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <span className="text-slate-300">
                      {t("server.quickStart.step2")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <span className="text-slate-300">
                      {t("server.quickStart.step3")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <span className="text-slate-300">
                      {t("server.quickStart.step4")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" className="py-20 px-4 bg-slate-800/50">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              {t("join.title")}
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              {t("join.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                {t("join.connectServer")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
              >
                <Disc className="mr-2 h-5 w-5" />
                {t("join.joinDiscord")}
              </Button>
            </div>

            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Youtube className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Disc className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 rounded bg-green-500"></div>
            <span className="text-xl font-bold text-white">EGA Roleplay</span>
          </div>
          <p className="text-slate-400">{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
