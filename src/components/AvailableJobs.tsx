import { 
  Utensils, Coffee, Wrench, Bike, Dice5, Music, GlassWater, Home, Beer, 
  Fuel, Store, Factory, Fish, Crosshair, Truck, Package, Car, Pickaxe, 
  CarFront, Wheat, Bus, Search, Anchor, Zap, Flame, Box, Leaf, Newspaper, Cone,
  ShoppingBag, Wrench as Tool, Skull, Coins, Printer, FileWarning, Wine, Swords, Landmark, FlaskConical
} from "lucide-react";

export default function AvailableJobs({ t }: { t: any }) {
  if (!t?.availableJobs?.privateJobs || !t?.availableJobs?.freelanceJobs) {
    return null;
  }

  const privateJobs = [
    { key: 'wigwam', icon: Utensils, color: 'text-orange-500', border: 'group-hover:border-orange-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(249,115,22,0.15)]' },
    { key: 'leapfrogCoffee', icon: Coffee, color: 'text-amber-700', border: 'group-hover:border-amber-700', shadow: 'group-hover:shadow-[0_0_50px_rgba(180,83,9,0.15)]' },
    { key: 'pearls', icon: Utensils, color: 'text-cyan-400', border: 'group-hover:border-cyan-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]' },
    { key: 'mechanic', icon: Wrench, color: 'text-green-500', border: 'group-hover:border-green-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(34,197,94,0.15)]' },
    { key: 'bikersMecano', icon: Bike, color: 'text-slate-400', border: 'group-hover:border-slate-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(148,163,184,0.15)]' },
    { key: 'casino', icon: Dice5, color: 'text-red-500', border: 'group-hover:border-red-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(239,68,68,0.15)]' },
    { key: 'nightclubLux', icon: Music, color: 'text-purple-500', border: 'group-hover:border-purple-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]' },
    { key: 'nightclubUnicorn', icon: GlassWater, color: 'text-pink-500', border: 'group-hover:border-pink-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(236,72,153,0.15)]' },
    { key: 'realEstate', icon: Home, color: 'text-blue-500', border: 'group-hover:border-blue-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]' },
  ];

  const freelanceJobs = [
    { key: 'gasStation', icon: Fuel, color: 'text-red-400', border: 'group-hover:border-red-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(248,113,113,0.15)]' },
    { key: 'store', icon: Store, color: 'text-emerald-400', border: 'group-hover:border-emerald-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(52,211,153,0.15)]' },
    { key: 'factories', icon: Factory, color: 'text-gray-400', border: 'group-hover:border-gray-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(156,163,175,0.15)]' },
    { key: 'fishing', icon: Fish, color: 'text-blue-400', border: 'group-hover:border-blue-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(96,165,250,0.15)]' },
    { key: 'hunting', icon: Crosshair, color: 'text-green-700', border: 'group-hover:border-green-700', shadow: 'group-hover:shadow-[0_0_50px_rgba(21,128,61,0.15)]' },
    { key: 'trucker', icon: Truck, color: 'text-orange-400', border: 'group-hover:border-orange-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(251,146,60,0.15)]' },
    { key: 'delivery', icon: Package, color: 'text-yellow-400', border: 'group-hover:border-yellow-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(250,204,21,0.15)]' },
    { key: 'taxi', icon: Car, color: 'text-yellow-500', border: 'group-hover:border-yellow-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(234,179,8,0.15)]' },
    { key: 'mining', icon: Pickaxe, color: 'text-stone-400', border: 'group-hover:border-stone-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(168,162,158,0.15)]' },
    { key: 'tow', icon: CarFront, color: 'text-red-600', border: 'group-hover:border-red-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(220,38,38,0.15)]' },
    { key: 'farmer', icon: Wheat, color: 'text-lime-500', border: 'group-hover:border-lime-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(132,204,22,0.15)]' },
    { key: 'busDriver', icon: Bus, color: 'text-yellow-600', border: 'group-hover:border-yellow-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(202,138,4,0.15)]' },
    { key: 'detectorist', icon: Search, color: 'text-zinc-400', border: 'group-hover:border-zinc-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(161,161,170,0.15)]' },
    { key: 'diver', icon: Anchor, color: 'text-cyan-600', border: 'group-hover:border-cyan-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(8,145,178,0.15)]' },
    { key: 'electrician', icon: Zap, color: 'text-yellow-400', border: 'group-hover:border-yellow-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(250,204,21,0.15)]' },
    { key: 'firefighter', icon: Flame, color: 'text-red-600', border: 'group-hover:border-red-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(220,38,38,0.15)]' },
    { key: 'forklift', icon: Box, color: 'text-orange-600', border: 'group-hover:border-orange-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(234,88,12,0.15)]' },
    { key: 'gardener', icon: Leaf, color: 'text-green-600', border: 'group-hover:border-green-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(22,163,74,0.15)]' },
    { key: 'hotdog', icon: Utensils, color: 'text-red-500', border: 'group-hover:border-red-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(239,68,68,0.15)]' },
    { key: 'newsReporter', icon: Newspaper, color: 'text-blue-300', border: 'group-hover:border-blue-300', shadow: 'group-hover:shadow-[0_0_50px_rgba(147,197,253,0.15)]' },
    { key: 'pizza', icon: Utensils, color: 'text-orange-500', border: 'group-hover:border-orange-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(249,115,22,0.15)]' },
    { key: 'projectCar', icon: CarFront, color: 'text-slate-500', border: 'group-hover:border-slate-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(100,116,139,0.15)]' },
    { key: 'roadHelper', icon: Cone, color: 'text-orange-500', border: 'group-hover:border-orange-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(249,115,22,0.15)]' },
  ];

  const illegalMissions = [
    { key: 'bagSnatch', icon: ShoppingBag, color: 'text-zinc-500', border: 'group-hover:border-zinc-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(113,113,122,0.15)]' },
    { key: 'carTheft', icon: Car, color: 'text-red-500', border: 'group-hover:border-red-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(239,68,68,0.15)]' },
    { key: 'chopshop', icon: Tool, color: 'text-orange-700', border: 'group-hover:border-orange-700', shadow: 'group-hover:shadow-[0_0_50px_rgba(194,65,12,0.15)]' },
    { key: 'cocaine', icon: Skull, color: 'text-slate-200', border: 'group-hover:border-slate-200', shadow: 'group-hover:shadow-[0_0_50px_rgba(226,232,240,0.15)]' },
    { key: 'cornerDeal', icon: Coins, color: 'text-green-400', border: 'group-hover:border-green-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(74,222,128,0.15)]' },
    { key: 'counterfeit', icon: Printer, color: 'text-emerald-500', border: 'group-hover:border-emerald-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(16,185,129,0.15)]' },
    { key: 'illegalDiving', icon: Anchor, color: 'text-blue-800', border: 'group-hover:border-blue-800', shadow: 'group-hover:shadow-[0_0_50px_rgba(30,64,175,0.15)]' },
    { key: 'fraud', icon: FileWarning, color: 'text-yellow-600', border: 'group-hover:border-yellow-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(202,138,4,0.15)]' },
    { key: 'gunSmuggling', icon: Crosshair, color: 'text-stone-600', border: 'group-hover:border-stone-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(87,83,78,0.15)]' },
    { key: 'illegalDelivery', icon: Truck, color: 'text-red-800', border: 'group-hover:border-red-800', shadow: 'group-hover:shadow-[0_0_50px_rgba(153,27,27,0.15)]' },
    { key: 'meth', icon: FlaskConical, color: 'text-blue-400', border: 'group-hover:border-blue-400', shadow: 'group-hover:shadow-[0_0_50px_rgba(96,165,250,0.15)]' },
    { key: 'moneyLaundering', icon: Store, color: 'text-purple-600', border: 'group-hover:border-purple-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(147,51,234,0.15)]' },
    { key: 'moonshine', icon: Wine, color: 'text-amber-600', border: 'group-hover:border-amber-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(217,119,6,0.15)]' },
    { key: 'npcBoxing', icon: Swords, color: 'text-red-500', border: 'group-hover:border-red-500', shadow: 'group-hover:shadow-[0_0_50px_rgba(239,68,68,0.15)]' },
    { key: 'weed', icon: Leaf, color: 'text-green-600', border: 'group-hover:border-green-600', shadow: 'group-hover:shadow-[0_0_50px_rgba(22,163,74,0.15)]' },
    { key: 'robberies', icon: Landmark, color: 'text-red-700', border: 'group-hover:border-red-700', shadow: 'group-hover:shadow-[0_0_50px_rgba(185,28,28,0.15)]' },
  ];

  return (
    <section id="available-jobs" className="py-20 px-4 bg-[#140f0b]/50">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t.availableJobs.title}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter">{t.availableJobs.subtitle}</p>
        </div>

        {/* Private Jobs Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 font-orbitron border-l-4 border-purple-500 pl-4">
            {t.availableJobs.privateJobs.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privateJobs.map((job) => (
              <div key={job.key} className={`group relative bg-[#140f0b] rounded-xl border border-[hsl(215_18%_20%)] p-6 transition-all duration-300 hover:-translate-y-1 ${job.border} ${job.shadow}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-opacity-10 bg-white`}>
                    <job.icon className={`w-8 h-8 ${job.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2 font-orbitron group-hover:text-white transition-colors">
                      {t.availableJobs.privateJobs[job.key].title}
                    </h4>
                    <p className="text-sm text-[hsl(220_15%_72%)] font-inter leading-relaxed">
                      {t.availableJobs.privateJobs[job.key].description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Freelance Jobs Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 font-orbitron border-l-4 border-green-500 pl-4">
            {t.availableJobs.freelanceJobs.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelanceJobs.map((job) => (
              <div key={job.key} className={`group relative bg-[#140f0b] rounded-xl border border-[hsl(215_18%_20%)] p-6 transition-all duration-300 hover:-translate-y-1 ${job.border} ${job.shadow}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-opacity-10 bg-white`}>
                    <job.icon className={`w-8 h-8 ${job.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2 font-orbitron group-hover:text-white transition-colors">
                      {t.availableJobs.freelanceJobs[job.key].title}
                    </h4>
                    <p className="text-sm text-[hsl(220_15%_72%)] font-inter leading-relaxed">
                      {t.availableJobs.freelanceJobs[job.key].description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Illegal Missions Section */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 font-orbitron border-l-4 border-red-600 pl-4">
            {t.availableJobs.illegalMissions.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {illegalMissions.map((job) => (
              <div key={job.key} className={`group relative bg-[#140f0b] rounded-xl border border-[hsl(215_18%_20%)] p-6 transition-all duration-300 hover:-translate-y-1 ${job.border} ${job.shadow}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-opacity-10 bg-white`}>
                    <job.icon className={`w-8 h-8 ${job.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2 font-orbitron group-hover:text-white transition-colors">
                      {t.availableJobs.illegalMissions[job.key].title}
                    </h4>
                    <p className="text-sm text-[hsl(220_15%_72%)] font-inter leading-relaxed">
                      {t.availableJobs.illegalMissions[job.key].description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
