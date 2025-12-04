"use client";

import { useState } from "react";
import { 
  Award, 
  Star, 
  Crown, 
  Gem, 
  Sparkles, 
  Trophy, 
  Zap, 
  Diamond,
  Flame
} from "lucide-react";

interface MembershipTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  benefits: string[];
  color: string;
  glowColor: string;
  gradient: string;
  link: string;
}

export default function MembershipPricing({ t }: { t: any }) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const memberships: MembershipTier[] = [
    {
      id: "bronze",
      name: "Bronze",
      icon: <Award className="h-16 w-16" />,
      price: 10,
      benefits: ["Vehicle Tier 2 or add-on ped"],
      color: "#CD7F32",
      glowColor: "205, 127, 50",
      gradient: "from-[#CD7F32] to-[#8B5A2B]",
      link: "https://egamarketplace.com/p/bronze-membership"
    },
    {
      id: "silver",
      name: "Silver",
      icon: <Star className="h-16 w-16" />,
      price: 20,
      benefits: ["Vehicle Tier 1"],
      color: "#C0C0C0",
      glowColor: "192, 192, 192",
      gradient: "from-[#C0C0C0] to-[#808080]",
      link: "https://egamarketplace.com/p/silver-membership-2"
    },
    {
      id: "gold",
      name: "Gold",
      icon: <Crown className="h-16 w-16" />,
      price: 30,
      benefits: ["Exclusive Vehicle"],
      color: "#FFD700",
      glowColor: "255, 215, 0",
      gradient: "from-[#FFD700] to-[#FFA500]",
      link: "https://egamarketplace.com/p/gold-membership-1"
    },
    {
      id: "platinum",
      name: "Platinum",
      icon: <Gem className="h-16 w-16" />,
      price: 40,
      benefits: ["1 mlo"],
      color: "#E5E4E2",
      glowColor: "229, 228, 226",
      gradient: "from-[#E5E4E2] to-[#BCC6CC]",
      link: "https://egamarketplace.com/p/platinum-membership"
    },
    {
      id: "diamond",
      name: "Diamond",
      icon: <Diamond className="h-16 w-16" />,
      price: 40,
      benefits: ["Company Tier 2"],
      color: "#B9F2FF",
      glowColor: "185, 242, 255",
      gradient: "from-[#B9F2FF] to-[#00C8FF]",
      link: "https://egamarketplace.com/p/diamond-membership"
    },
    {
      id: "prime",
      name: "Prime",
      icon: <Sparkles className="h-16 w-16" />,
      price: 50,
      benefits: ["Company Tier 2", "Vehicle Tier 1"],
      color: "#9D00FF",
      glowColor: "157, 0, 255",
      gradient: "from-[#9D00FF] to-[#6A00B8]",
      link: "https://egamarketplace.com/p/prime-membership"
    },
    {
      id: "elite",
      name: "Elite",
      icon: <Trophy className="h-16 w-16" />,
      price: 70,
      benefits: ["Company Tier 2", "Exclusive Vehicle"],
      color: "#FF1493",
      glowColor: "255, 20, 147",
      gradient: "from-[#FF1493] to-[#C71585]",
      link: "https://egamarketplace.com/p/elite-membership"
    },
    {
      id: "ruby",
      name: "Ruby",
      icon: <Flame className="h-16 w-16" />,
      price: 70,
      benefits: ["Company Tier 1"],
      color: "#E0115F",
      glowColor: "224, 17, 95",
      gradient: "from-[#E0115F] to-[#9B111E]",
      link: "https://egamarketplace.com/p/ruby-membership"
    },
    {
      id: "ultimate",
      name: "Ultimate",
      icon: <Zap className="h-16 w-16" />,
      price: 100,
      benefits: ["Company Tier 1", "Exclusive Vehicle"],
      color: "#00FFFF",
      glowColor: "0, 255, 255",
      gradient: "from-[#00FFFF] to-[#00CED1]",
      link: "https://egamarketplace.com/p/ultimate-membership"
    }
  ];

  const handleCardHover = (id: string, isHovering: boolean) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (isHovering) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  return (
    <section id="membership" className="py-20 px-4 bg-[#140f0b]/50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fa5d3d]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9D00FF]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4 font-orbitron tracking-wider">
            {t?.membershipPricing?.title || "Membership Tiers"}
          </h2>
          <p className="text-xl text-[hsl(220_15%_72%)] font-inter max-w-2xl mx-auto">
            {t?.membershipPricing?.subtitle || "  Choose your membership level and unlock exclusive benefits monthly"}
          </p>
        </div>

        {/* Membership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {memberships.map((membership) => {
            const isFlipped = flippedCards.has(membership.id);
            
            return (
              <div
                key={membership.id}
                className="perspective-1000 h-[400px]"
                onMouseEnter={() => handleCardHover(membership.id, true)}
                onMouseLeave={() => handleCardHover(membership.id, false)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                  }}
                >
                  {/* Front of Card */}
                  <div
                    className="absolute w-full h-full backface-hidden rounded-2xl border-2 overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      borderColor: membership.color,
                      background: `linear-gradient(135deg, rgba(20, 15, 11, 0.95) 0%, rgba(20, 15, 11, 0.85) 100%)`,
                      boxShadow: `0 0 30px rgba(${membership.glowColor}, 0.3)`
                    }}
                  >
                    <div className="relative h-full flex flex-col items-center justify-center p-8">
                      {/* Gradient Overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${membership.gradient} opacity-10`}
                      />
                      
                      {/* Icon */}
                      <div
                        className="relative mb-6 transition-transform duration-300 hover:scale-110"
                        style={{ color: membership.color }}
                      >
                        {membership.icon}
                      </div>

                      {/* Membership Name */}
                      <h3
                        className="text-3xl font-bold mb-4 font-orbitron tracking-wider"
                        style={{ color: membership.color }}
                      >
                        {membership.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-white">
                            ${membership.price}
                          </span>
                          <span className="text-xl text-[hsl(220_15%_72%)] ml-2">
                            USD
                          </span>
                        </div>
                      </div>

                      {/* Hover Hint */}
                      <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-sm text-[hsl(220_15%_72%)] animate-pulse">
                          Hover to see details
                        </p>
                      </div>

                      {/* Decorative Elements */}
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${membership.color}, transparent)`
                        }}
                      />
                      <div
                        className="absolute bottom-0 left-0 w-full h-1"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${membership.color}, transparent)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div
                    className="absolute w-full h-full backface-hidden rounded-2xl border-2 overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderColor: membership.color,
                      background: `linear-gradient(135deg, rgba(20, 15, 11, 0.98) 0%, rgba(20, 15, 11, 0.95) 100%)`,
                      boxShadow: `0 0 40px rgba(${membership.glowColor}, 0.4)`
                    }}
                  >
                    <div className="relative h-full flex flex-col p-8">
                      {/* Gradient Overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${membership.gradient} opacity-20`}
                      />

                      {/* Header */}
                      <div className="relative mb-6 text-center">
                        <h3
                          className="text-2xl font-bold mb-2 font-orbitron"
                          style={{ color: membership.color }}
                        >
                          {membership.name} Membership
                        </h3>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-white">
                            ${membership.price}
                          </span>
                          <span className="text-lg text-[hsl(220_15%_72%)] ml-2">
                            USD
                          </span>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="relative flex-1">
                        <h4 className="text-lg font-semibold text-white mb-4 font-inter">
                          Includes:
                        </h4>
                        <ul className="space-y-3">
                          {membership.benefits.map((benefit, index) => (
                            <li
                              key={index}
                              className="flex items-start text-[hsl(220_15%_72%)]"
                            >
                              <span
                                className="mr-3 mt-1 flex-shrink-0"
                                style={{ color: membership.color }}
                              >
                                ✦
                              </span>
                              <span className="text-base">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}

                      <a
                        href={membership.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group block text-center"
                        style={{
                          background: `linear-gradient(135deg, ${membership.color}, rgba(${membership.glowColor}, 0.8))`,
                          boxShadow: `0 4px 15px rgba(${membership.glowColor}, 0.4)`
                        }}
                      >
                        <span className="relative z-10">Purchase Now</span>
                        <div
                          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Styles for 3D Transform */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}
