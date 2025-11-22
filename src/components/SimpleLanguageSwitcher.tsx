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
      subtitle: "Serve and protect the citizens of Los Santos",
      police: { title: "Los Santos Police Dept", description: "Enforce the law and maintain order" },
      ems: { title: "Emergency Medical Services", description: "Save lives and provide medical care" },
      doj: { title: "Department of Justice", description: "Uphold the law and ensure justice" },
    },
    illegalFactions: {
      title: "Illegal Factions",
      subtitle: "Dominate the underworld of Los Santos",
      gangs: { title: "The Families", description: "Chamberlain Hills. Green is the color. Loyalty and respect. Gang wars against Ballas and Vagos." },
      ballas: { title: "Ballas", description: "Davis. Purple is the color. Power and influence. Eternal rivals of The Families." },
      vagos: { title: "Los Santos Vagos", description: "East Los Santos. Yellow is the color. Drug trade and territory control. Rivals of The Families." },
      marabunta: { title: "Marabunta Grande", description: "El Burro Heights. Blue is the color. Ruthless and organized. Expanding their influence across the city." },
      gambino: { title: "Gambino Crime Family", description: "Italian-American organized crime. Business ventures and underground operations. Old-school mafia traditions." },
      velocity: { title: "Velocity Crew", description: "Street racing and high-speed heists. Fast cars and faster money. Living life in the fast lane." },
      lostmc: { title: "The Lost MC", description: "Outlaw motorcycle club. Brotherhood and freedom on two wheels. Controlling the streets with iron fists." },
      sonofanarchy: { title: "Sons of Anarchy MC", description: "Notorious biker gang. Gun running and protection rackets. Loyalty above all else." },
      cartel: { title: "The Cartel", description: "International drug trafficking organization. Vast networks and ruthless enforcement. Power through fear and money." },
    },
    availableJobs: {
      title: "Civilian Jobs",
      subtitle: "Earn an honest living in the city",
      mechanic: { title: "Mechanic", description: "Repair and modify vehicles" },
      taxi: { title: "Taxi Driver", description: "Transport citizens across the city" },
      reporter: { title: "News Reporter", description: "Cover the latest breaking news" },
      delivery: { title: "Delivery Driver", description: "Deliver packages and goods" },
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
        "© 2024 EGA Roleplay. All rights reserved. | GTA V FiveM Roleplay Server",
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
      title: "Server Rules",
      subtitle: "Follow these rules to ensure a great experience for everyone",
      rules: [
        "Respect all players and staff members",
        "No cheating, hacking, or exploiting",
        "Stay in character at all times",
        "No random killing or griefing",
        "Follow real-life laws and regulations",
        "Use proper English in public channels",
        "No advertising other servers",
        "Report rule violations to staff",
      ],
    },
    howToPlay: {
      title: "How to Play on EGA Roleplay",
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
      title: "القطاعات القانونية",
      subtitle: "اخدم واحمي مواطني لوس سانتوس",
      police: { title: "شرطة لوس سانتوس", description: "طبق القانون وحافظ على النظام" },
      ems: { title: "الخدمات الطبية الطارئة", description: "أنقذ الأرواح وقدم الرعاية الطبية" },
      doj: { title: "وزارة العدل", description: "طبق القانون واضمن العدالة" },
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
    },
    availableJobs: {
      title: "وظائف مدنية",
      subtitle: "اكسب عيشك بشرف في المدينة",
      mechanic: { title: "ميكانيكي", description: "إصلاح وتعديل المركبات" },
      taxi: { title: "سائق تاكسي", description: "نقل المواطنين عبر المدينة" },
      reporter: { title: "مراسل صحفي", description: "غطِ آخر الأخبار العاجلة" },
      delivery: { title: "سائق توصيل", description: "توصيل الطرود والبضائع" },
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
      title: "قواعد الخادم",
      subtitle: "اتبع هذه القواعد لضمان تجربة رائعة للجميع",
      rules: [
        "احترم جميع اللاعبين وأعضاء الطاقم",
        "لا غش أو اختراق أو استغلال",
        "ابق في شخصيتك في جميع الأوقات",
        "لا قتل عشوائي أو مضايقة",
        "اتبع قوانين الحياة الواقعية",
        "استخدم الإنجليزية المناسبة في القنوات العامة",
        "لا إعلان عن خوادم أخرى",
        "أبلغ عن انتهاكات القواعد للطاقم",
      ],
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
      title: "القطاعات القانونية",
      subtitle: "اخدم واحمي مواطني لوس سانتوس",
      police: { title: "شرطة لوس سانتوس", description: "طبق القانون وحافظ على النظام" },
      ems: { title: "الخدمات الطبية الطارئة", description: "أنقذ الأرواح وقدم الرعاية الطبية" },
      doj: { title: "وزارة العدل", description: "طبق القانون واضمن العدالة" },
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
    },
    availableJobs: {
      title: "وظائف مدنية",
      subtitle: "صور فرنك بالحلال في المدينة",
      mechanic: { title: "ميكانيسيان", description: "صلح وعدل الكراهب" },
      taxi: { title: "سائق تاكسي", description: "وصل العباد في المدينة" },
      reporter: { title: "صحافي", description: "غطي آخر الأخبار" },
      delivery: { title: "ليفرور", description: "وصل الكوليات والسلعة" },
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
      title: "قواعد السيرفر",
      subtitle: "اتبع هاذي القواعد باش تضمن تجربة رائعة للكل",
      rules: [
        "احترم جميع اللاعبين وأعضاء الطاقم",
        "ما تغشش ولا تخترق ولا تستغل",
        "ابق في شخصيتك في كل الأوقات",
        "ما تقتلش عشوائي ولا تضايق",
        "اتبع قوانين الحياة الواقعية",
        "استخدم الإنجليزية المناسبة في القنوات العامة",
        "ما تعلنش على سيرفرات أخرى",
        "أبلغ عن انتهاكات القواعد للطاقم",
      ],
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
