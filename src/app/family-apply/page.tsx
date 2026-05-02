"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Send, 
  CheckCircle, 
  Shield, 
  User, 
  Target, 
  MessageSquare,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations } from "@/components/SimpleLanguageSwitcher";
import { useSession, signIn } from "next-auth/react";

export default function FamilyApplyPage() {
  const { data: session, status } = useSession();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [t, setT] = useState(translations.en);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    ic_name: "",
    age: "",
    experience: "",
    backstory: "",
    discord_id: ""
  });

  // Load saved language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
    setT(translations[savedLanguage as keyof typeof translations]);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail.language;
      setCurrentLanguage(newLanguage);
      setT(translations[newLanguage as keyof typeof translations]);
    };

    window.addEventListener("languageChanged", handleLanguageChange as EventListener);
    return () => window.removeEventListener("languageChanged", handleLanguageChange as EventListener);
  }, []);

  // Automatically fill and lock Discord ID when session is available
  useEffect(() => {
    const user = session?.user as any;
    if (user?.id) {
      setFormData(prev => ({ ...prev, discord_id: user.id }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return toast.error("Please login first");
    setLoading(true);
    
    try {
      const res = await fetch("/api/apply/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Application Sent", { description: "Our family leadership will review your application soon." });
      } else {
        toast.error("Error", { description: "Failed to submit application." });
      }
    } catch (err) {
      toast.error("Error", { description: "Connection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header t={t} />
      
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest"
          >
            <Users size={14} /> Official Recruitment
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter font-orbitron"
          >
            JOIN THE <span className="text-orange-500 italic">EGA FAMILY</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            We are looking for serious and mature roleplayers to build strong, realistic storylines and maintain professionalism within EGA.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Info Sidebar */}
          <div className="xl:col-span-5 space-y-8">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#222] shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/5 blur-[80px] group-hover:bg-orange-500/10 transition-colors" />
                
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Shield className="text-orange-500" />
                            About Us
                        </h2>
                        <p className="text-gray-400 leading-relaxed italic border-l-2 border-orange-500/30 pl-4">
                          "We are a structured and disciplined family focused on delivering high-quality, immersive roleplay. Our goal is to build strong, realistic storylines while maintaining professionalism and respect within the community."
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Target className="text-orange-500" />
                            What We Look For
                        </h2>
                        <ul className="space-y-3">
                            {[
                              "Serious and mature roleplayers",
                              "Active members committed to long-term RP",
                              "Individuals who respect server rules",
                              "Players capable of engaging scenarios"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                                    <ChevronRight className="shrink-0 text-orange-500/50" size={16} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <MessageSquare className="text-orange-500" />
                            Requirements
                        </h2>
                        <ul className="space-y-3">
                            {[
                              "Consistent activity",
                              "Functional microphone & clear communication",
                              "Good knowledge of RP standards (No Fail RP)",
                              "Ability to follow leadership & work as a team"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                                    <ChevronRight className="shrink-0 text-orange-500/50" size={16} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex gap-4">
                    <div className="mt-1"><AlertTriangle className="text-orange-500" size={20} /></div>
                    <div className="space-y-1">
                        <p className="font-bold text-orange-500">Notice</p>
                        <p className="text-sm text-gray-400">Applications are reviewed carefully. Only serious candidates will be considered. Submit your application below.</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="xl:col-span-7">
            {status === "loading" ? (
                <div className="h-full flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            ) : !session ? (
                <div className="bg-[#0d0d0d] p-12 rounded-3xl border border-[#1a1a1a] shadow-2xl text-center space-y-6">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                        <User className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Authentication Required</h2>
                    <p className="text-gray-400">You must connect with Discord to submit an application. This ensures your application is tied to your account.</p>
                    <Button 
                        onClick={() => signIn("discord")}
                        className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold px-8 h-12"
                    >
                        Connect with Discord
                    </Button>
                </div>
            ) : success ? (
                <div className="h-full flex items-center justify-center py-20">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                        <CheckCircle className="text-green-500 w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold">Application Received</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">Thank you for your interest. Our leadership will review your backstory and experience soon.</p>
                    <Button onClick={() => window.location.href = "/"} className="bg-white text-black font-bold">Return Home</Button>
                  </motion.div>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-12 bg-[#0d0d0d] p-8 md:p-12 rounded-3xl border border-[#1a1a1a] shadow-2xl">
                    
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                                <User size={18}/>
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Personal Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-400">IC Name</Label>
                                <Input required placeholder="E.G: James White" value={formData.ic_name} onChange={(e) => setFormData({...formData, ic_name: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12 focus:border-orange-500/50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Age</Label>
                                <Input required type="number" placeholder="21" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12 focus:border-orange-500/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-400">Previous RP experience</Label>
                            <textarea required placeholder="Describe your history on other servers..." value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full bg-[#1a1a1a] border-[#333] rounded-md p-4 text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-orange-500/50" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-400">Detailed character backstory</Label>
                            <textarea required placeholder="Who is your character? What are their motivations?" value={formData.backstory} onChange={(e) => setFormData({...formData, backstory: e.target.value})} className="w-full bg-[#1a1a1a] border-[#333] rounded-md p-4 text-sm min-h-[200px] focus:outline-none focus:ring-1 focus:ring-orange-500/50" />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 text-lg font-black tracking-widest bg-orange-500 hover:bg-orange-600 text-black shadow-2xl shadow-orange-900/20"
                    >
                        {loading ? "PROCCESSING..." : "SUBMIT APPLICATION"}
                    </Button>
                </form>
            )}
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}
