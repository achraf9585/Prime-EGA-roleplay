"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸", country: "United States" },
  { code: "ar", name: "العربية", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "tn", name: "تونسي", flag: "🇹🇳", country: "Tunisia" },
];

// Translation data
const translations = {
  en: {
    navigation: {
      features: "Features",
      server: "Server Info",
      join: "Join Now",
      connect: "Connect",
    },
    hero: {
      badge: "Premium Roleplay Experience",
      title: "Welcome to",
      titleHighlight: "Prime EGA Roleplay",
      description:
        "Experience the most immersive GTA V FiveM roleplay server. Join thousands of players in Los Santos for realistic roleplay, unique jobs, and unforgettable stories.",
      joinServer: "Join Server Now",
      joinDiscord: "Join Discord",
    },
    features: {
      title: "Why Choose EGA Roleplay?",
      subtitle: "Experience the best features in FiveM roleplay",
      activeCommunity: {
        title: "Active Community",
        description:
          "Join 500+ active players daily in immersive roleplay scenarios",
      },
      professionalStaff: {
        title: "Professional Staff",
        description:
          "Experienced admins and moderators ensure fair and fun gameplay",
      },
      customVehicles: {
        title: "Custom Vehicles",
        description:
          "Drive unique cars, motorcycles, and aircraft with custom handling",
      },
      housingSystem: {
        title: "Housing System",
        description: "Buy, sell, and customize your dream home in Los Santos",
      },
      uniqueJobs: {
        title: "Unique Jobs",
        description:
          "From legal careers to criminal enterprises, find your path",
      },
      realisticEconomy: {
        title: "Realistic Economy",
        description:
          "Dynamic economy system with realistic prices and opportunities",
      },
    },
    legalFactions: {
      title: "Legal Factions",
      subtitle: "Serve and protect Los Santos with honor",
      government: {
        title: "Government",
        description: "Lead the city with integrity and vision. Shape policies, manage budgets, and ensure the prosperity of Los Santos through effective governance and public service."
      },
      embassy: {
        title: "Embassy",
        description: "Represent international interests and facilitate diplomatic relations. Handle visa applications, protect foreign nationals, and maintain peace between nations."
      },
      doj: {
        title: "Department of Justice",
        description: "Uphold the law through fair prosecution and defense. Serve as judges, prosecutors, and public defenders to ensure justice prevails in Los Santos."
      },
      lspd: {
        title: "LSPD Police",
        description: "Protect and serve the citizens of Los Santos. Patrol the streets, investigate crimes, and maintain law and order in the city's urban areas."
      },
      sheriff: {
        title: "Sheriff Department",
        description: "Guard the county and rural areas with dedication. Patrol highways, respond to emergencies, and keep the outskirts of Los Santos safe."
      },
      ambulanceCity: {
        title: "Ambulance City",
        description: "Save lives in the heart of Los Santos. Respond to medical emergencies, provide critical care, and transport patients to safety in urban environments."
      },
      ambulanceNorth: {
        title: "Ambulance North Side",
        description: "Deliver emergency medical services to the northern regions. Cover rural areas and provide life-saving care where it's needed most."
      },
      ambulanceCayo: {
        title: "Ambulance Cayo Perico",
        description: "Provide medical assistance on the tropical island paradise. Handle unique island emergencies and ensure the safety of all visitors and residents."
      },
      journalist: {
        title: "Journalist / News Agency",
        description: "Report the truth and keep citizens informed. Investigate stories, conduct interviews, and broadcast breaking news across Los Santos."
      }
    },
    illegalFactions: {
      title: "Illegal Factions",
      subtitle: "Dominate the underworld of Los Santos",
      gangs: { title: "The Families", description: "Once kings of Los Santos, the Families fractured over leadership disputes and lost ground. Today they’re rebuilding—uniting smaller sets, protecting neighborhoods, and fighting to reclaim their old reputation from the Ballas and other rivals." },
      ballas: { title: "Ballas", description: "Born from old neighborhood alliances and crack-era violence, the Ballas control blocks through fear and fast money. Betrayal and internal power struggles made them tougher, and now they push to reclaim territory by force, especially against the Families." },
      vagos: { title: " Vagos", description: "The Vagos grew from migrant neighborhoods and built an empire through numbers and aggression. Known for intimidation and brutal retaliation, they maintain a tight grip on weapons trading and smaller drug corners, especially around East LS." },
      marabunta: { title: "Marabunta Grande", description: "Marabunta built their foundation from refugees fleeing Central American conflicts. Skilled in guerrilla tactics, they’re feared for unpredictability and extreme loyalty to their leaders. Their rivalry with the Vagos and Families fuels constant street wars." },
      gambino: { title: "Gambino Crime Family", description: "The Gambino Family arrived in Los Santos decades ago during a quiet expansion from Liberty City. What began as a small crew now manages the city’s most discreet criminal operations—black market deals, protection rackets, and money laundering through luxury businesses. Led by a cold, calculating boss, they prefer order, tradition, and silent power over street chaos." },
      velocity: { title: "Velocity Crew", description: "The Velocity Crew started as a small group of adrenaline junkies hosting midnight races in the industrial zones of Los Santos. After a legendary racer created the Black List—a ranking of the top 15 drivers—the crew evolved into a full criminal network. They now control illegal tuning shops, run high-risk vehicle heists, and move stolen supercars across the city.Recruits must beat a Black List member in a one-on-one race to join, and losing a challenge means surrendering your ride.The crew doesn t care about turf or colors—only horsepower, reputation, and glory. One goal drives them: Be the fastest or be forgotten." },
      lostmc: { title: "The Lost MC", description: "The Lost MC rose from a small Sandy Shores biker crew into a full outlaw chapter. After losing members in past wars, they rebuilt with iron discipline and a hunger for territory. They operate from rural hideouts, striking hard and disappearing fast." },
      sonofanarchy: { title: "Sons of Anarchy MC", description: "Inspired by old-school biker legacy, the Sons established a San Andreas chapter with strict rules and military-like structure. They balance legit businesses with black-market gun trades, maintaining a dangerous but calculated presence across highways and truck routes." },
      cartel: { title: "The Cartel", description: "After being hunted in Mexico, the Sinaloa Cartel relocated their high-ranking commanders to Cayo Perico, turning the island into a fortified drug stronghold. With private soldiers, ex-military strategists, and a deadly network of dealers across Los Santos, the cartel runs massive production labs, smuggling routes, and hits on anyone who threatens their empire." },
      animals: {
        title: "The Animalz",
        description: "During the ongoing Los Santos blackouts, the first group to exploit the chaos is The Animalz—a loose crew of young looters and vandals striking across Los Santos and Blaine County. They hit stores, supply depots, and vehicles during power outages, sometimes using stolen military-grade gear recovered by LCPD. While they have no clear hierarchy or turf, the repeated appearance of members in white rabbit masks suggests hidden leadership. Police are actively hunting anyone connected to these dangerous blackout looters."
      },
      newOrder: {
        title: "The New Order",
        description: "The New Order is a hidden faction created to expose the City Keepers’ false promise of “protection.” By day, members live as normal citizens; by night, they move through the shadows—spreading doubt, sabotaging control, and revealing the truth the Keepers try to hide."
      },
      otf: {
        title: "OTF",
        description: "OTF is a tight-knit family gang built around music, loyalty, and street influence. Formed by rappers and producers who grew up together, OTF runs the city’s underground sound—mixing raw lyricism, heavy beats, and real street stories. Their studios act as both creative hubs and meeting points where business, deals, and strategy flow behind closed doors. They use music to speak for the streets, protect their own, and grow their power. Known for their unity, style, and ambition, OTF balances fame and street presence—turning their talent into influence and their influence into respect. OTF: loyalty first, music second, everything else after."
      },
    },
    availableJobs: {
      title: "Available Jobs",
      subtitle: "Choose your career path in Los Santos",
      privateJobs: {
        title: "Private Jobs",
        wigwam: { title: "Wigwam / BurgerShot", description: "Serve the best burgers in town and keep the citizens fed." },
        leapfrogCoffee: { title: "Leapfrog Coffee", description: "A relaxing atmosphere with coffee, pastries, and cute cats." },
        pearls: { title: "Pearls Resort", description: "Fine dining seafood experience for the elite of Los Santos." },
        mechanic: { title: "Mechanic", description: "Repair, tune, and customize vehicles to perfection." },
        bikersMecano: { title: "Bikers Mechanic", description: "Specialized repair shop for motorcycles and biker culture." },
        casino: { title: "Casino", description: "High stakes gambling, entertainment, and luxury." },
        nightclubLux: { title: "Nightclub – Tropical Nights", description: "The premier nightlife destination for parties and events." },
        nightclubUnicorn: { title: "Nightclub – Unicorn", description: "Adult entertainment and exclusive bar services." },
        realEstate: { title: "Real Estate", description: "Buy, sell, and rent properties across the city." },
        lostMcBar: { title: "Lost MC Bar", description: "The hangout spot for the Lost MC and their allies." }
      },
      freelanceJobs: {
        title: "Freelance Jobs",
        gasStation: { title: "Gas Station Ownership", description: "Manage fuel supplies and run your own convenience store." },
        store: { title: "Store Ownership", description: "Own and operate retail stores throughout the city." },
        factories: { title: "Factories Ownership", description: "Manage industrial production and manufacturing lines." },
        fishing: { title: "Fishing", description: "Catch fresh fish from the ocean and sell for profit." },
        hunting: { title: "Hunting", description: "Track and hunt wildlife in the wilderness." },
        trucker: { title: "Trucker Job", description: "Transport goods and cargo across the state." },
        delivery: { title: "Delivery Job", description: "Deliver packages and parcels to customers on time." },
        taxi: { title: "Taxi Job", description: "Transport passengers to their destinations safely." },
        mining: { title: "Mining Job", description: "Extract valuable resources and minerals from the earth." },
        tow: { title: "Tow/Recovery Job", description: "Recover stranded or illegally parked vehicles." },
        farmer: { title: "Farmer Job", description: "Cultivate crops and manage livestock on the farm." }
      }
    },
    server: {
      title: "Server Information",
      subtitle: "Everything you need to know about EGA Roleplay",
      details: {
        title: "Server Details",
        serverName: "Server Name:",
        serverNameValue: "EGA Roleplay",
        playersOnline: "Players Online:",
        playersOnlineValue: "128/128",
        uptime: "Uptime:",
        uptimeValue: "99.9%",
        location: "Location:",
        locationValue: "Europe",
      },
      quickStart: {
        title: "Quick Start",
        step1: "Download FiveM",
        step2: "Join our Discord",
        step3: "Create your character",
        step4: "Start your roleplay journey",
      },
    },
    join: {
      title: "Ready to Join?",
      description:
        "Connect to our server and start your roleplay adventure today!",
      connectServer: "Connect to Server",
      joinDiscord: "Join Discord",
    },
    footer: {
      copyright:
        "© 2025 Prime EGA Roleplay. All rights reserved. | GTA V FiveM Roleplay Server",
    },
    video: {
      title: "Watch Our Trailer",
      description: "Experience the immersive world of EGA Roleplay",
    },
    rpApplication: {
      title: "Roleplay Application",
      subtitle: "Join our community and start your roleplay journey",
      form: {
        characterName: "Character Name",
        age: "Age",
        background: "Character Background",
        experience: "Roleplay Experience",
        submit: "Submit Application",
        success: "Application submitted successfully!",
      },
    },
    serverRules: {
      title: "Prime EGA Roleplay Guidelines",
      subtitle: "Follow these rules to ensure a great experience for everyone",
      rules: [
        {
          title: "Logic RP",
          description: "Everything should stay within the roleplay based on common logic relative to the character's status, wealth, and social position in the community.",
          example: "A burger worker eligible for dirty business can rob a shop to earn extra money, but the burger owner, due to their wealth and social status, should not engage in street-level crimes. Instead, they could participate in high-stakes operations like money laundering."
        },
        {
          title: "Reason RP",
          description: "Every action, legal or illegal, must be supported by a valid reason grounded in common sense.",
          example: "A burger worker should not rob a wallet from another player without a valid reason due to their social and economic status. Conversely, a gang member might rob someone in their territory to assert dominance or send a message, but this should always be justified with a creative and valid reason."
        },
        {
          title: "Mere RP",
          description: "Mere RP refers to low-level interactions based on primitive motives like random robbing, killing, or vandalizing without purpose.",
          rule: "Any form of mere RP not supported by valid reasons and common logic will result in a severe ban. Ensure all actions have a purpose and contribute meaningfully to the roleplay narrative."
        },
        {
          title: "Gradation RP",
          description: "Characters should progress logically through their journey, climbing the ladder step by step.",
          rule: "Jumping from low-level roles directly to high-stakes crimes or major criminal roles is not acceptable. Build your character's story from small beginnings to larger, more complex roles and actions, reflecting a natural progression."
        },
        {
          title: "Fail RP",
          description: "Failure to adhere to roleplay immersion or logic will be penalized.",
          rule: "Any behavior that disrupts the roleplay world, such as out-of-character (OOC) actions, meta-gaming, or power-gaming, will result in a ban. Roleplay should be consistent and uninterrupted by OOC elements."
        },
        {
          title: "Force RP",
          description: "Forcing actions or ideas onto other players is prohibited.",
          rule: "You cannot coerce other players into actions or situations without a valid, roleplay-relevant reason. For instance, a kidnapper cannot force a hostage to commit suicide unless it is contextually justified and the hostage's situation reflects this possibility. Law enforcement cannot force a player to become a criminal without clear evidence."
        },
        {
          title: "Interaction RP",
          description: "Roleplay scenes should be interactive and balanced, involving mutual exchange.",
          rule: "When creating a scene, ensure that there is a give-and-take dynamic. If you kidnap a group of people, you must offer something in return or engage in a meaningful interaction. The scene should involve negotiation or exchange, rather than simply taking without giving."
        },
        {
          title: "Involvement RP",
          description: "When deciding to involve yourself in an ongoing scene, ensure it is logical and well-planned.",
          rule: "Intervening in an ongoing scenes requires adherence to three major rules: Logic RP (ensure your involvement makes sense), Reason RP (have a valid reason for interference), and Fear RP (acknowledge the risks involved). If these conditions are not met, avoid intervening. This rule aims to replace traditional third-party interference with more thoughtful engagement."
        },
        {
          title: "Fear RP",
          description: "Characters should realistically react to threats and risks.",
          rule: "Plan your actions considering potential dangers. Avoid scenarios where your character acts without regard for risk or consequences, as this can lead to power gaming or breaking the roleplay immersion."
        },
        {
          title: "Assuming RP",
          description: "This is a reminder that roleplay has no inherent limits if logic and reason are respected.",
          rule: "In scenarios involving large-scale confrontations or events, like a crew of 5 being ambushed by 25, ensure that your response is balanced and realistic. The focus should be on creative, logical, and fair roleplay, respecting the overall narrative and balance of the game world."
        },
        {
          title: "Lore RP",
          description: "This is a reminder that the overall Lore needs to be respected.",
          rule: "Respect the established lore, and contribute to it thoughtfully with your roleplay. You also need to evolve your character story and create a meaningful and a creative storyline for it."
        },
        {
          title: "Toxicity",
          description: "Any kind of toxicity in or outside the RP podium is severely prohibited.",
          rule: "Any kind of cheating, exploit bugs, massive insulting, sexual harassments, family or religious aggression or even sexism will be treated as a permanent suspension from the podium."
        }
      ]
    },
    howToPlay: {
      title: "How to Play on Prime EGA Roleplay",
      subtitle: "Follow these simple steps to join our community",
      steps: [
        {
          title: "Buy & Install GTA V",
          description:
            "Purchase GTA V from Steam, Epic Games, or Rockstar Games Launcher and install it on your PC",
          icon: "🎮",
        },
        {
          title: "Install FiveM",
          description:
            "Download and install FiveM client from the official website to enable multiplayer roleplay",
          icon: "🔧",
        },
        {
          title: "Join Our Discord",
          description:
            "Join our Discord server to get the connection details and start your roleplay journey",
          icon: "💬",
        },
      ],
    },
    membershipPricing: {
      title: "Membership Tiers",
      subtitle: "Choose your monthly membership level and unlock exclusive benefits ",
    },
    redeem: {
      badge: "Rewards",
      title: "Redeem Your Code",
      subtitle: "Enter your exclusive code to unlock special rewards in-game."
    },
  },
  ar: {
    navigation: {
      features: "المميزات",
      server: "معلومات الخادم",
      join: "انضم الآن",
      connect: "اتصل",
    },
    hero: {
      badge: "تجربة لعب الأدوار المتميزة",
      title: "مرحباً بك في",
      titleHighlight: "Prime EGA Roleplay",
      description:
        "استمتع بأكثر خوادم لعب الأدوار غامرة في GTA V FiveM. انضم إلى آلاف اللاعبين في لوس سانتوس للعب الأدوار الواقعي والوظائف الفريدة والقصص التي لا تُنسى.",
      joinServer: "انضم للخادم الآن",
      joinDiscord: "انضم لديسكورد",
    },
    features: {
      title: "لماذا تختار EGA Roleplay؟",
      subtitle: "استمتع بأفضل المميزات في لعب الأدوار FiveM",
      activeCommunity: {
        title: "مجتمع نشط",
        description:
          "انضم إلى أكثر من 500 لاعب نشط يومياً في سيناريوهات لعب الأدوار الغامرة",
      },
      professionalStaff: {
        title: "طاقم محترف",
        description: "مدراء ومشرفون ذوو خبرة يضمنون لعباً عادلاً وممتعاً",
      },
      customVehicles: {
        title: "مركبات مخصصة",
        description: "اقود سيارات ودراجات نارية وطائرات فريدة مع معالجة مخصصة",
      },
      housingSystem: {
        title: "نظام السكن",
        description: "اشتر وبع وخصص منزل أحلامك في لوس سانتوس",
      },
      uniqueJobs: {
        title: "وظائف فريدة",
        description:
          "من المهن القانونية إلى المشاريع الإجرامية، اعثر على طريقك",
      },
      realisticEconomy: {
        title: "اقتصاد واقعي",
        description: "نظام اقتصاد ديناميكي بأسعار وفرص واقعية",
      },
    },
    legalFactions: {
      title: "الفصائل القانونية",
      subtitle: "خدمة وحماية لوس سانتوس بشرف",
      government: {
        title: "الحكومة",
        description: "قيادة المدينة بنزاهة ورؤية. صياغة السياسات، إدارة الميزانيات، وضمان ازدهار لوس سانتوس من خلال الحكم الفعال والخدمة العامة."
      },
      embassy: {
        title: "السفارة",
        description: "تمثيل المصالح الدولية وتسهيل العلاقات الدبلوماسية. معالجة طلبات التأشيرات، حماية المواطنين الأجانب، والحفاظ على السلام بين الدول."
      },
      doj: {
        title: "وزارة العدل",
        description: "إقامة العدل من خلال الادعاء والدفاع العادل. العمل كقضاة ومدعين عامين ومحامين عامين لضمان سيادة العدالة في لوس سانتوس."
      },
      lspd: {
        title: "شرطة لوس سانتوس",
        description: "حماية وخدمة مواطني لوس سانتوس. دوريات الشوارع، التحقيق في الجرائم، والحفاظ على القانون والنظام في المناطق الحضرية."
      },
      sheriff: {
        title: "إدارة الشريف",
        description: "حراسة المقاطعة والمناطق الريفية بتفان. دوريات الطرق السريعة، الاستجابة للطوارئ، والحفاظ على أمان ضواحي لوس سانتوس."
      },
      ambulanceCity: {
        title: "إسعاف المدينة",
        description: "إنقاذ الأرواح في قلب لوس سانتوس. الاستجابة للطوارئ الطبية، تقديم الرعاية الحرجة، ونقل المرضى إلى بر الأمان في البيئات الحضرية."
      },
      ambulanceNorth: {
        title: "إسعاف الجانب الشمالي",
        description: "تقديم خدمات الطوارئ الطبية للمناطق الشمالية. تغطية المناطق الريفية وتقديم الرعاية المنقذة للحياة حيث تشتد الحاجة إليها."
      },
      ambulanceCayo: {
        title: "إسعاف كايو بيريكو",
        description: "تقديم المساعدة الطبية في جنة الجزيرة الاستوائية. التعامل مع حالات الطوارئ الفريدة في الجزيرة وضمان سلامة جميع الزوار والمقيمين."
      },
      journalist: {
        title: "صحفي / وكالة أنباء",
        description: "الإبلاغ عن الحقيقة وإبقاء المواطنين على اطلاع. التحقيق في القصص، إجراء المقابلات، وبث الأخبار العاجلة في جميع أنحاء لوس سانتوس."
      }
    },
    illegalFactions: {
      title: "القطاعات غير القانونية",
      subtitle: "سيطر على العالم السفلي في لوس سانتوس",
      gangs: { title: "العائلات", description: "تشامبرلين هيلز. الأخضر هو اللون. الولاء والاحترام. حروب العصابات ضد البالاس والفاغوس." },
      ballas: { title: "البالاس", description: "ديفيس. اللون البنفسجي. القوة والنفوذ. المنافسون الأبديون للعائلات." },
      vagos: { title: "لوس سانتوس فاغوس", description: "شرق لوس سانتوس. الأصفر هو اللون. تجارة المخدرات والسيطرة على الأراضي. منافسو العائلات." },
      marabunta: { title: "مارابونتا غراندي", description: "إل بورو هايتس. الأزرق هو اللون. قساة ومنظمون. يوسعون نفوذهم في المدينة." },
      gambino: { title: "عائلة غامبينو الإجرامية", description: "جريمة منظمة إيطالية أمريكية. مشاريع تجارية وعمليات سرية. تقاليد المافيا القديمة." },
      velocity: { title: "طاقم فيلوسيتي", description: "سباق الشوارع والسرقات عالية السرعة. سيارات سريعة ومال أسرع. العيش في المسار السريع." },
      lostmc: { title: "ذا لوست إم سي", description: "نادي دراجات نارية خارج عن القانون. الأخوة والحرية على عجلتين. السيطرة على الشوارع بقبضة حديدية." },
      sonofanarchy: { title: "سونز أوف أناركي إم سي", description: "عصابة دراجات نارية سيئة السمعة. تهريب الأسلحة وعصابات الحماية. الولاء فوق كل شيء." },
      cartel: { title: "الكارتل", description: "منظمة دولية لتهريب المخدرات. شبكات واسعة وإنفاذ قاس. القوة من خلال الخوف والمال." },
      animals: {
        title: "The Animalz",
        description: "During the ongoing Los Santos blackouts, the first group to exploit the chaos is The Animalz—a loose crew of young looters and vandals striking across Los Santos and Blaine County. They hit stores, supply depots, and vehicles during power outages, sometimes using stolen military-grade gear recovered by LCPD. While they have no clear hierarchy or turf, the repeated appearance of members in white rabbit masks suggests hidden leadership. Police are actively hunting anyone connected to these dangerous blackout looters."
      },
      newOrder: {
        title: "The New Order",
        description: "The New Order is a hidden faction created to expose the City Keepers’ false promise of “protection.” By day, members live as normal citizens; by night, they move through the shadows—spreading doubt, sabotaging control, and revealing the truth the Keepers try to hide."
      },
      otf: {
        title: "OTF",
        description: "OTF is a tight-knit family gang built around music, loyalty, and street influence. Formed by rappers and producers who grew up together, OTF runs the city’s underground sound—mixing raw lyricism, heavy beats, and real street stories. Their studios act as both creative hubs and meeting points where business, deals, and strategy flow behind closed doors. They use music to speak for the streets, protect their own, and grow their power. Known for their unity, style, and ambition, OTF balances fame and street presence—turning their talent into influence and their influence into respect. OTF: loyalty first, music second, everything else after."
      },
    },
    availableJobs: {
      title: "الوظائف المتاحة",
      subtitle: "اختر مسارك المهني في لوس سانتوس",
      privateJobs: {
        title: "وظائف خاصة",
        wigwam: { title: "ويغوام / برجر شوت", description: "قدم أفضل البرغر في المدينة وأطعم المواطنين." },
        leapfrogCoffee : { title: "مقهىLeapfrog", description: "جو مريح مع القهوة والمعجنات والقطط اللطيفة." },
        pearls: { title: "مطعم بيرلز", description: "تجربة طعام بحري فاخرة لنخبة لوس سانتوس." },
        mechanic: { title: "ميكانيكي", description: "إصلاح وضبط وتخصيص المركبات بإتقان." },
        bikersMecano: { title: "ميكانيكي الدراجات", description: "ورشة إصلاح متخصصة للدراجات النارية وثقافة الدراجين." },
        casino: { title: "كازينو", description: "مقامرة عالية المخاطر وترفيه ورفاهية." },
        nightclubLux: { title: "ملهى ليلي - لوكس", description: "الوجهة الأولى للحياة الليلية للحفلات والفعاليات." },
        nightclubUnicorn: { title: "ملهى ليلي - يونيكورن", description: "ترفيه للكبار وخدمات بار حصرية." },
        realEstate: { title: "العقارات", description: "شراء وبيع وتأجير العقارات في جميع أنحاء المدينة." },
        lostMcBar: { title: "بار لوست إم سي", description: "مكان التجمع لنادي لوست إم سي وحلفائهم." }
      },
      freelanceJobs: {
        title: "وظائف حرة",
        gasStation: { title: "ملكية محطة وقود", description: "إدارة إمدادات الوقود وتشغيل متجرك الخاص." },
        store: { title: "ملكية متجر", description: "امتلاك وتشغيل متاجر البيع بالتجزئة في جميع أنحاء المدينة." },
        factories: { title: "ملكية مصانع", description: "إدارة الإنتاج الصناعي وخطوط التصنيع." },
        fishing: { title: "صيد السمك", description: "اصطياد الأسماك الطازجة من المحيط وبيعها للربح." },
        hunting: { title: "الصيد", description: "تتبع وصيد الحياة البرية في البرية." },
        trucker: { title: "سائق شاحنة", description: "نقل البضائع والشحنات عبر الولاية." },
        delivery: { title: "وظيفة التوصيل", description: "توصيل الطرود والشحنات للعملاء في الوقت المحدد." },
        taxi: { title: "سائق تاكسي", description: "نقل الركاب إلى وجهاتهم بأمان." },
        mining: { title: "وظيفة التعدين", description: "استخراج الموارد والمعادن القيمة من الأرض." },
        tow: { title: "سحب / استعادة السيارات", description: "استعادة المركبات المتعطلة أو المتوقفة بشكل غير قانوني." },
        farmer: { title: "مزارع", description: "زراعة المحاصيل وإدارة الماشية في المزرعة." }
      }
    },
    server: {
      title: "معلومات الخادم",
      subtitle: "كل ما تحتاج لمعرفته عن EGA Roleplay",
      details: {
        title: "تفاصيل الخادم",
        serverName: "اسم الخادم:",
        serverNameValue: "EGA Roleplay",
        playersOnline: "اللاعبون المتصلون:",
        playersOnlineValue: "128/128",
        uptime: "وقت التشغيل:",
        uptimeValue: "99.9%",
        location: "الموقع:",
        locationValue: "أوروبا",
      },
      quickStart: {
        title: "البدء السريع",
        step1: "تحميل FiveM",
        step2: "انضم لديسكورد",
        step3: "أنشئ شخصيتك",
        step4: "ابدأ رحلتك في لعب الأدوار",
      },
    },
    join: {
      title: "مستعد للانضمام؟",
      description: "اتصل بخادمنا وابدأ مغامرة لعب الأدوار اليوم!",
      connectServer: "اتصل بالخادم",
      joinDiscord: "انضم لديسكورد",
    },
    footer: {
      copyright:
        "© 2024 EGA Roleplay. جميع الحقوق محفوظة. | خادم لعب الأدوار GTA V FiveM",
    },
    video: {
      title: "شاهد الإعلان الترويجي",
      description: "استمتع بالعالم الغامر لـ EGA Roleplay",
    },
    rpApplication: {
      title: "طلب لعب الأدوار",
      subtitle: "انضم إلى مجتمعنا وابدأ رحلتك في لعب الأدوار",
      form: {
        characterName: "اسم الشخصية",
        age: "العمر",
        background: "خلفية الشخصية",
        experience: "خبرة لعب الأدوار",
        submit: "إرسال الطلب",
        success: "تم إرسال الطلب بنجاح!",
      },
    },
    serverRules: {
      title: "Prime EGA Roleplay Guidelines",
      subtitle: "Follow these rules to ensure a great experience for everyone",
      rules: [
        {
          title: "Logic RP",
          description: "Everything should stay within the roleplay based on common logic relative to the character's status, wealth, and social position in the community.",
          example: "A burger worker eligible for dirty business can rob a shop to earn extra money, but the burger owner, due to their wealth and social status, should not engage in street-level crimes. Instead, they could participate in high-stakes operations like money laundering."
        },
        {
          title: "Reason RP",
          description: "Every action, legal or illegal, must be supported by a valid reason grounded in common sense.",
          example: "A burger worker should not rob a wallet from another player without a valid reason due to their social and economic status. Conversely, a gang member might rob someone in their territory to assert dominance or send a message, but this should always be justified with a creative and valid reason."
        },
        {
          title: "Mere RP",
          description: "Mere RP refers to low-level interactions based on primitive motives like random robbing, killing, or vandalizing without purpose.",
          rule: "Any form of mere RP not supported by valid reasons and common logic will result in a severe ban. Ensure all actions have a purpose and contribute meaningfully to the roleplay narrative."
        },
        {
          title: "Gradation RP",
          description: "Characters should progress logically through their journey, climbing the ladder step by step.",
          rule: "Jumping from low-level roles directly to high-stakes crimes or major criminal roles is not acceptable. Build your character's story from small beginnings to larger, more complex roles and actions, reflecting a natural progression."
        },
        {
          title: "Fail RP",
          description: "Failure to adhere to roleplay immersion or logic will be penalized.",
          rule: "Any behavior that disrupts the roleplay world, such as out-of-character (OOC) actions, meta-gaming, or power-gaming, will result in a ban. Roleplay should be consistent and uninterrupted by OOC elements."
        },
        {
          title: "Force RP",
          description: "Forcing actions or ideas onto other players is prohibited.",
          rule: "You cannot coerce other players into actions or situations without a valid, roleplay-relevant reason. For instance, a kidnapper cannot force a hostage to commit suicide unless it is contextually justified and the hostage's situation reflects this possibility. Law enforcement cannot force a player to become a criminal without clear evidence."
        },
        {
          title: "Interaction RP",
          description: "Roleplay scenes should be interactive and balanced, involving mutual exchange.",
          rule: "When creating a scene, ensure that there is a give-and-take dynamic. If you kidnap a group of people, you must offer something in return or engage in a meaningful interaction. The scene should involve negotiation or exchange, rather than simply taking without giving."
        },
        {
          title: "Involvement RP",
          description: "When deciding to involve yourself in an ongoing scene, ensure it is logical and well-planned.",
          rule: "Intervening in an ongoing scenes requires adherence to three major rules: Logic RP (ensure your involvement makes sense), Reason RP (have a valid reason for interference), and Fear RP (acknowledge the risks involved). If these conditions are not met, avoid intervening. This rule aims to replace traditional third-party interference with more thoughtful engagement."
        },
        {
          title: "Fear RP",
          description: "Characters should realistically react to threats and risks.",
          rule: "Plan your actions considering potential dangers. Avoid scenarios where your character acts without regard for risk or consequences, as this can lead to power gaming or breaking the roleplay immersion."
        },
        {
          title: "Assuming RP",
          description: "This is a reminder that roleplay has no inherent limits if logic and reason are respected.",
          rule: "In scenarios involving large-scale confrontations or events, like a crew of 5 being ambushed by 25, ensure that your response is balanced and realistic. The focus should be on creative, logical, and fair roleplay, respecting the overall narrative and balance of the game world."
        },
        {
          title: "Lore RP",
          description: "This is a reminder that the overall Lore needs to be respected.",
          rule: "Respect the established lore, and contribute to it thoughtfully with your roleplay. You also need to evolve your character story and create a meaningful and a creative storyline for it."
        },
        {
          title: "Toxicity",
          description: "Any kind of toxicity in or outside the RP podium is severely prohibited.",
          rule: "Any kind of cheating, exploit bugs, massive insulting, sexual harassments, family or religious aggression or even sexism will be treated as a permanent suspension from the podium."
        }
      ]
    },
    howToPlay: {
      title: "كيف تلعب على EGA Roleplay",
      subtitle: "اتبع هذه الخطوات البسيطة للانضمام إلى مجتمعنا",
      steps: [
        {
          title: "اشتر وثبت GTA V",
          description:
            "اشتر GTA V من Steam أو Epic Games أو Rockstar Games Launcher وثبته على جهازك",
          icon: "🎮",
        },
        {
          title: "ثبت FiveM",
          description:
            "حمل وثبت عميل FiveM من الموقع الرسمي لتمكين لعب الأدوار متعدد اللاعبين",
          icon: "🔧",
        },
        {
          title: "انضم لديسكورد",
          description:
            "انضم لخادم الديسكورد الخاص بنا للحصول على تفاصيل الاتصال وبدء رحلتك في لعب الأدوار",
          icon: "💬",
        },
      ],
    },
    membershipPricing: {
      title: "مستويات العضوية",
      subtitle: "اختر مستوى عضويتك واحصل على مزايا حصرية",
    },
    redeem: {
      badge: "المكافآت",
      title: "استرداد الرمز الخاص بك",
      subtitle: "أدخل الرمز الحصري الخاص بك لفتح مكافآت خاصة داخل اللعبة."
    },
  },
  tn: {
    navigation: {
      features: "الخصائص",
      server: "معلومات السيرفر",
      join: "انضم دابا",
      connect: "اتصل",
    },
    hero: {
      badge: "تجربة لعب الأدوار الممتازة",
      title: "أهلاً وسهلاً في",
      titleHighlight: " Prime EGA Roleplay",
      description:
        "استمتع بأحسن سيرفر لعب الأدوار في GTA V FiveM. انضم مع آلاف اللاعبين في لوس سانتوس للعب الأدوار الواقعي والوظائف المميزة والقصص اللي ما تنساش.",
      joinServer: "انضم للسيرفر دابا",
      joinDiscord: "انضم للديسكورد",
    },
    features: {
      title: "علاش تختار EGA Roleplay؟",
      subtitle: "استمتع بأحسن الخصائص في لعب الأدوار FiveM",
      activeCommunity: {
        title: "مجتمع نشط",
        description:
          "انضم مع أكثر من 500 لاعب نشط كل يوم في سيناريوهات لعب الأدوار الغامرة",
      },
      professionalStaff: {
        title: "طاقم محترف",
        description: "مدراء ومشرفين ذوي خبرة يضمنوا لعب عادل وممتع",
      },
      customVehicles: {
        title: "عربيات مخصصة",
        description: "اقود سيارات ودراجات نارية وطائرات مميزة مع معالجة مخصصة",
      },
      housingSystem: {
        title: "نظام السكن",
        description: "اشري وبع وخصص بيت أحلامك في لوس سانتوس",
      },
      uniqueJobs: {
        title: "وظائف مميزة",
        description: "من المهن القانونية للمشاريع الإجرامية، لاقي طريقك",
      },
      realisticEconomy: {
        title: "اقتصاد واقعي",
        description: "نظام اقتصاد ديناميكي بأسعار وفرص واقعية",
      },
    },
    legalFactions: {
      title: "الفصائل القانونية",
      subtitle: "خدمة وحماية لوس سانتوس بشرف",
      government: {
        title: "الحكومة",
        description: "قود المدينة بنزاهة ورؤية. صيغ السياسات، دير الميزانيات، وضمن ازدهار لوس سانتوس من خلال الحكم الفعال والخدمة العامة."
      },
      embassy: {
        title: "السفارة",
        description: "مثل المصالح الدولية وسهل العلاقات الدبلوماسية. عالج طلبات التأشيرات، احمي المواطنين الأجانب، وحافظ على السلام بين الدول."
      },
      doj: {
        title: "وزارة العدل",
        description: "أقم العدل من خلال الادعاء والدفاع العادل. اخدم كقاضي أو مدعي عام أو محامي عام باش تضمن سيادة العدالة في لوس سانتوس."
      },
      lspd: {
        title: "شرطة لوس سانتوس",
        description: "احمي واخدم مواطني لوس سانتوس. دوريات الشوارع، التحقيق في الجرائم، والحفاظ على القانون والنظام في المناطق الحضرية."
      },
      sheriff: {
        title: "إدارة الشريف",
        description: "احرس المقاطعة والمناطق الريفية بتفان. دوريات الطرق السريعة، الاستجابة للطوارئ، والحفاظ على أمان ضواحي لوس سانتوس."
      },
      ambulanceCity: {
        title: "إسعاف المدينة",
        description: "أنقذ الأرواح في قلب لوس سانتوس. استجب للطوارئ الطبية، قدم الرعاية الحرجة، وانقل المرضى للأمان في البيئات الحضرية."
      },
      ambulanceNorth: {
        title: "إسعاف الجانب الشمالي",
        description: "قدم خدمات الطوارئ الطبية للمناطق الشمالية. غطي المناطق الريفية وقدم الرعاية المنقذة للحياة وين تشد الحاجة."
      },
      ambulanceCayo: {
        title: "إسعاف كايو بيريكو",
        description: "قدم المساعدة الطبية في جنة الجزيرة الاستوائية. تعامل مع حالات الطوارئ الفريدة في الجزيرة وضمن سلامة كل الزوار والمقيمين."
      },
      journalist: {
        title: "صحفي / وكالة أنباء",
        description: "أبلغ على الحقيقة وخلي المواطنين على اطلاع. حقق في القصص، اعمل مقابلات، وبث الأخبار العاجلة في كل لوس سانتوس."
      }
    },
    illegalFactions: {
      title: "القطاعات غير القانونية",
      subtitle: "سيطر على العالم السفلي في لوس سانتوس",
      gangs: { title: "العائلات", description: "تشامبرلين هيلز. الأخضر هو اللون. الولاء والاحترام. حروب العصابات ضد البالاس والفاغوس." },
      ballas: { title: "البالاس", description: "ديفيس. اللون البنفسجي. القوة والنفوذ. المنافسون الأبديون للعائلات." },
      vagos: { title: "لوس سانتوس فاغوس", description: "شرق لوس سانتوس. الأصفر هو اللون. تجارة المخدرات والسيطرة على الأراضي. منافسو العائلات." },
      marabunta: { title: "مارابونتا غراندي", description: "إل بورو هايتس. الأزرق هو اللون. قساة ومنظمون. يوسعون نفوذهم في المدينة." },
      gambino: { title: "عائلة غامبينو الإجرامية", description: "جريمة منظمة إيطالية أمريكية. مشاريع تجارية وعمليات سرية. تقاليد المافيا القديمة." },
      velocity: { title: "طاقم فيلوسيتي", description: "سباق الشوارع والسرقات عالية السرعة. سيارات سريعة ومال أسرع. العيش في المسار السريع." },
      lostmc: { title: "ذا لوست إم سي", description: "نادي دراجات نارية خارج عن القانون. الأخوة والحرية على عجلتين. السيطرة على الشوارع بقبضة حديدية." },
      sonofanarchy: { title: "سونز أوف أناركي إم سي", description: "عصابة دراجات نارية سيئة السمعة. تهريب الأسلحة وعصابات الحماية. الولاء فوق كل شيء." },
      cartel: { title: "الكارتل", description: "منظمة دولية لتهريب المخدرات. شبكات واسعة وإنفاذ قاس. القوة من خلال الخوف والمال." },
      animals: {
        title: "The Animalz",
        description: "During the ongoing Los Santos blackouts, the first group to exploit the chaos is The Animalz—a loose crew of young looters and vandals striking across Los Santos and Blaine County. They hit stores, supply depots, and vehicles during power outages, sometimes using stolen military-grade gear recovered by LCPD. While they have no clear hierarchy or turf, the repeated appearance of members in white rabbit masks suggests hidden leadership. Police are actively hunting anyone connected to these dangerous blackout looters."
      },
      newOrder: {
        title: "The New Order",
        description: "The New Order is a hidden faction created to expose the City Keepers’ false promise of “protection.” By day, members live as normal citizens; by night, they move through the shadows—spreading doubt, sabotaging control, and revealing the truth the Keepers try to hide."
      },
      otf: {
        title: "OTF",
        description: "OTF is a tight-knit family gang built around music, loyalty, and street influence. Formed by rappers and producers who grew up together, OTF runs the city’s underground sound—mixing raw lyricism, heavy beats, and real street stories. Their studios act as both creative hubs and meeting points where business, deals, and strategy flow behind closed doors. They use music to speak for the streets, protect their own, and grow their power. Known for their unity, style, and ambition, OTF balances fame and street presence—turning their talent into influence and their influence into respect. OTF: loyalty first, music second, everything else after."
      },
    },
    availableJobs: {
      title: "الوظائف المتاحة",
      subtitle: "اختر مسارك المهني في لوس سانتوس",
      privateJobs: {
        title: "وظائف خاصة",
        wigwam: { title: "ويغوام / برجر شوت", description: "قدم أفضل البرغر في المدينة وأطعم المواطنين." },
        leapfrogCoffee: { title: "مقهى القطط", description: "جو مريح مع القهوة والمعجنات والقطط اللطيفة." },
        pearls: { title: "مطعم بيرلز", description: "تجربة طعام بحري فاخرة لنخبة لوس سانتوس." },
        mechanic: { title: "ميكانيكي", description: "إصلاح وضبط وتخصيص المركبات بإتقان." },
        bikersMecano: { title: "ميكانيكي الدراجات", description: "ورشة إصلاح متخصصة للدراجات النارية وثقافة الدراجين." },
        casino: { title: "كازينو", description: "مقامرة عالية المخاطر وترفيه ورفاهية." },
        nightclubLux: { title: "ملهى ليلي - لوكس", description: "الوجهة الأولى للحياة الليلية للحفلات والفعاليات." },
        nightclubUnicorn: { title: "ملهى ليلي - يونيكورن", description: "ترفيه للكبار وخدمات بار حصرية." },
        realEstate: { title: "العقارات", description: "شراء وبيع وتأجير العقارات في جميع أنحاء المدينة." },
        lostMcBar: { title: "بار لوست إم سي", description: "مكان التجمع لنادي لوست إم سي وحلفائهم." }
      },
      freelanceJobs: {
        title: "وظائف حرة",
        gasStation: { title: "ملكية محطة وقود", description: "إدارة إمدادات الوقود وتشغيل متجرك الخاص." },
        store: { title: "ملكية متجر", description: "امتلاك وتشغيل متاجر البيع بالتجزئة في جميع أنحاء المدينة." },
        factories: { title: "ملكية مصانع", description: "إدارة الإنتاج الصناعي وخطوط التصنيع." },
        fishing: { title: "صيد السمك", description: "اصطياد الأسماك الطازجة من المحيط وبيعها للربح." },
        hunting: { title: "الصيد", description: "تتبع وصيد الحياة البرية في البرية." },
        trucker: { title: "سائق شاحنة", description: "نقل البضائع والشحنات عبر الولاية." },
        delivery: { title: "وظيفة التوصيل", description: "توصيل الطرود والشحنات للعملاء في الوقت المحدد." },
        taxi: { title: "سائق تاكسي", description: "نقل الركاب إلى وجهاتهم بأمان." },
        mining: { title: "وظيفة التعدين", description: "استخراج الموارد والمعادن القيمة من الأرض." },
        tow: { title: "سحب / استعادة السيارات", description: "استعادة المركبات المتعطلة أو المتوقفة بشكل غير قانوني." },
        farmer: { title: "مزارع", description: "زراعة المحاصيل وإدارة الماشية في المزرعة." }
      }
    },
    server: {
      title: "معلومات السيرفر",
      subtitle: "كل ما تحتاجه تعرف على EGA Roleplay",
      details: {
        title: "تفاصيل السيرفر",
        serverName: "اسم السيرفر:",
        serverNameValue: "EGA Roleplay",
        playersOnline: "اللاعبين المتصلين:",
        playersOnlineValue: "128/128",
        uptime: "وقت التشغيل:",
        uptimeValue: "99.9%",
        location: "الموقع:",
        locationValue: "أوروبا",
      },
      quickStart: {
        title: "البداية السريعة",
        step1: "حمل FiveM",
        step2: "انضم للديسكورد",
        step3: "أنشئ شخصيتك",
        step4: "ابدأ رحلتك في لعب الأدوار",
      },
    },
    join: {
      title: "مستعد تنضم؟",
      description: "اتصل بسيرفرنا وابدأ مغامرة لعب الأدوار اليوم!",
      connectServer: "اتصل بالسيرفر",
      joinDiscord: "انضم للديسكورد",
    },
    footer: {
      copyright:
        "© 2024 EGA Roleplay. جميع الحقوق محفوظة. | سيرفر لعب الأدوار GTA V FiveM",
    },
    video: {
      title: "شوف الإعلان الترويجي",
      description: "استمتع بالعالم الغامر لـ EGA Roleplay",
    },
    rpApplication: {
      title: "طلب لعب الأدوار",
      subtitle: "انضم لمجتمعنا وابدأ رحلتك في لعب الأدوار",
      form: {
        characterName: "اسم الشخصية",
        age: "العمر",
        background: "خلفية الشخصية",
        experience: "خبرة لعب الأدوار",
        submit: "ابعث الطلب",
        success: "تم إرسال الطلب بنجاح!",
      },
    },
    serverRules: {
      title: "Prime EGA Roleplay Guidelines",
      subtitle: "Follow these rules to ensure a great experience for everyone",
      rules: [
        {
          title: "Logic RP",
          description: "Everything should stay within the roleplay based on common logic relative to the character's status, wealth, and social position in the community.",
          example: "A burger worker eligible for dirty business can rob a shop to earn extra money, but the burger owner, due to their wealth and social status, should not engage in street-level crimes. Instead, they could participate in high-stakes operations like money laundering."
        },
        {
          title: "Reason RP",
          description: "Every action, legal or illegal, must be supported by a valid reason grounded in common sense.",
          example: "A burger worker should not rob a wallet from another player without a valid reason due to their social and economic status. Conversely, a gang member might rob someone in their territory to assert dominance or send a message, but this should always be justified with a creative and valid reason."
        },
        {
          title: "Mere RP",
          description: "Mere RP refers to low-level interactions based on primitive motives like random robbing, killing, or vandalizing without purpose.",
          rule: "Any form of mere RP not supported by valid reasons and common logic will result in a severe ban. Ensure all actions have a purpose and contribute meaningfully to the roleplay narrative."
        },
        {
          title: "Gradation RP",
          description: "Characters should progress logically through their journey, climbing the ladder step by step.",
          rule: "Jumping from low-level roles directly to high-stakes crimes or major criminal roles is not acceptable. Build your character's story from small beginnings to larger, more complex roles and actions, reflecting a natural progression."
        },
        {
          title: "Fail RP",
          description: "Failure to adhere to roleplay immersion or logic will be penalized.",
          rule: "Any behavior that disrupts the roleplay world, such as out-of-character (OOC) actions, meta-gaming, or power-gaming, will result in a ban. Roleplay should be consistent and uninterrupted by OOC elements."
        },
        {
          title: "Force RP",
          description: "Forcing actions or ideas onto other players is prohibited.",
          rule: "You cannot coerce other players into actions or situations without a valid, roleplay-relevant reason. For instance, a kidnapper cannot force a hostage to commit suicide unless it is contextually justified and the hostage's situation reflects this possibility. Law enforcement cannot force a player to become a criminal without clear evidence."
        },
        {
          title: "Interaction RP",
          description: "Roleplay scenes should be interactive and balanced, involving mutual exchange.",
          rule: "When creating a scene, ensure that there is a give-and-take dynamic. If you kidnap a group of people, you must offer something in return or engage in a meaningful interaction. The scene should involve negotiation or exchange, rather than simply taking without giving."
        },
        {
          title: "Involvement RP",
          description: "When deciding to involve yourself in an ongoing scene, ensure it is logical and well-planned.",
          rule: "Intervening in an ongoing scenes requires adherence to three major rules: Logic RP (ensure your involvement makes sense), Reason RP (have a valid reason for interference), and Fear RP (acknowledge the risks involved). If these conditions are not met, avoid intervening. This rule aims to replace traditional third-party interference with more thoughtful engagement."
        },
        {
          title: "Fear RP",
          description: "Characters should realistically react to threats and risks.",
          rule: "Plan your actions considering potential dangers. Avoid scenarios where your character acts without regard for risk or consequences, as this can lead to power gaming or breaking the roleplay immersion."
        },
        {
          title: "Assuming RP",
          description: "This is a reminder that roleplay has no inherent limits if logic and reason are respected.",
          rule: "In scenarios involving large-scale confrontations or events, like a crew of 5 being ambushed by 25, ensure that your response is balanced and realistic. The focus should be on creative, logical, and fair roleplay, respecting the overall narrative and balance of the game world."
        },
        {
          title: "Lore RP",
          description: "This is a reminder that the overall Lore needs to be respected.",
          rule: "Respect the established lore, and contribute to it thoughtfully with your roleplay. You also need to evolve your character story and create a meaningful and a creative storyline for it."
        },
        {
          title: "Toxicity",
          description: "Any kind of toxicity in or outside the RP podium is severely prohibited.",
          rule: "Any kind of cheating, exploit bugs, massive insulting, sexual harassments, family or religious aggression or even sexism will be treated as a permanent suspension from the podium."
        }
      ]
    },
    howToPlay: {
      title: "كيفاش تلعب على EGA Roleplay",
      subtitle: "اتبع هاذي الخطوات البسيطة باش تنضم لمجتمعنا",
      steps: [
        {
          title: "اشري وثبت GTA V",
          description:
            "اشري GTA V من Steam أو Epic Games أو Rockstar Games Launcher وثبته على جهازك",
          icon: "🎮",
        },
        {
          title: "ثبت FiveM",
          description:
            "حمل وثبت عميل FiveM من الموقع الرسمي باش تمكن لعب الأدوار متعدد اللاعبين",
          icon: "🔧",
        },
        {
          title: "انضم للديسكورد",
          description:
            "انضم لخادم الديسكورد الخاص بنا باش تحصل على تفاصيل الاتصال وتبدأ رحلتك في لعب الأدوار",
          icon: "💬",
        },
      ],
    },
    membershipPricing: {
      title: "مستويات العضوية",
      subtitle: "اختار مستوى عضويتك واحصل على مزايا حصرية",
    },
    redeem: {
      badge: "المكافآت",
      title: "دخل الكود متاعك",
      subtitle: "حط الكود الحصري متاعك باش تربح جوائز خاصة في اللعبة."
    },
  },
};

export default function SimpleLanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    setIsOpen(false);

    // Dispatch custom event to notify the page component
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: newLanguage },
      })
    );
  };

  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 border-slate-600 text-slate-300 hover:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 light:border-gray-300 light:text-gray-700 light:hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl">{currentLang?.flag}</span>
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <Globe className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 dark:bg-slate-800 light:bg-white border border-slate-700 dark:border-slate-700 light:border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-3 text-left hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-gray-100 transition-colors flex items-center space-x-3 ${
                  currentLanguage === language.code
                    ? "bg-slate-700 dark:bg-slate-700 light:bg-gray-100 text-green-400 dark:text-green-400 light:text-green-600"
                    : "text-slate-300 dark:text-slate-300 light:text-gray-700"
                }`}
              >
                <span className="text-2xl">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-xs opacity-70">{language.country}</span>
                </div>
                {currentLanguage === language.code && (
                  <span className="ml-auto text-green-400 dark:text-green-400 light:text-green-600">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the translations for use in other components
export { translations };
