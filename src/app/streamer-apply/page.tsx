"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  Send, 
  CheckCircle, 
  Info, 
  Twitch, 
  Youtube, 
  Shield, 
  User, 
  Camera, 
  Clock, 
  ArrowRight,
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

export default function StreamerApplyPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    ingame_name_cid: "",
    discord_id: "",
    email: "",
    platform: "Twitch",
    channel_url: "",
    followers_count: "",
    rp_experience: "",
    ensemble_mindset: "",
    strict_rp_standards: "",
    history_info: "",
    sample_content: "",
    stream_schedule: "",
    privacy_comfort: "Yes"
  });

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
      const res = await fetch("/api/apply/streamer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Application Sent", { description: "Your details have been registered for review." });
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
      <Header t={translations.en} />
      
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest"
          >
            <Video size={14} /> Official Content Creator Program
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter"
          >
             BECOME AN <span className="text-amber-500 italic">EGA PARTNER</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            We are looking for dedicated storytellers who can maintain the integrity of a strict roleplay environment while showcasing the world of EGA.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Rules Sidebar */}
          <div className="xl:col-span-5 space-y-8">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#222] shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 blur-[80px] group-hover:bg-amber-500/10 transition-colors" />
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="text-amber-500" />
                    Guidelines & Rules
                </h2>
                
                <div className="space-y-8">
                    <RuleBlock 
                        num="1" 
                        title="Integrity & Anti-Metagaming"
                        rules={[
                          "No info-leak from stream chat to your character.",
                          "You are responsible for your community's behavior.",
                          "Hide sensitive activities (Drug spots, Admin talks)."
                        ]}
                    />
                    <RuleBlock 
                        num="2" 
                        title="The Ensemble Principle"
                        rules={[
                          "Respect the shared spotlight, don't force content.",
                          "Know when to lead a scene and when to step back.",
                          "Stay 100% In-Character. No talk-to-chat during scenes."
                        ]}
                    />
                    <RuleBlock 
                        num="3" 
                        title="Professionalism"
                        rules={[
                          "Keep overlays clean for a cinematic feel.",
                          "No OOC toxic behavior live on stream.",
                          "Respect the server staff and the cast."
                        ]}
                    />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex gap-4">
                    <div className="mt-1"><AlertTriangle className="text-amber-500" size={20} /></div>
                    <div className="space-y-1">
                        <p className="font-bold text-amber-500">Notice</p>
                        <p className="text-sm text-gray-400">Applications are reviewed manually by our Media Team. Status updates will be sent via Discord.</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="xl:col-span-7">
            {status === "loading" ? (
                <div className="h-full flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            ) : !session ? (
                <div className="bg-[#0d0d0d] p-12 rounded-3xl border border-[#1a1a1a] shadow-2xl text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                        <User className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Authentication Required</h2>
                    <p className="text-gray-400">You must connect with Discord to apply for the streamer program. This ensures we can link your application to your account.</p>
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
                    <h3 className="text-3xl font-bold">Application Registered</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">Your application is now under review. Please keep your Discord DM open.</p>
                    <Button onClick={() => window.location.href = "/"} className="bg-white text-black font-bold">Return Home</Button>
                  </motion.div>
               </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-12 bg-[#0d0d0d] p-8 md:p-12 rounded-3xl border border-[#1a1a1a] shadow-2xl">
                    
                    {/* Section 1: General */}
                    <FormSection title="General Information" icon={<User size={18}/>}>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-400">In-Game Name & CID</Label>
                                <Input required placeholder="E.G: James White [1021]" value={formData.ingame_name_cid} onChange={(e) => setFormData({...formData, ingame_name_cid: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400 italic">Discord User ID (Locked)</Label>
                                <Input disabled value={formData.discord_id} className="bg-[#0a0a0a] border-[#222] text-gray-500 h-12 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Email Address</Label>
                                <Input required type="email" placeholder="streamer@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Primary Platform</Label>
                                <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} className="w-full h-12 bg-[#1a1a1a] border-[#333] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500">
                                    <option>Twitch</option><option>YouTube</option><option>Kick</option><option>TikTok Live</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Channel / Followers Count</Label>
                                <Input required placeholder="2.5k Followers" value={formData.followers_count} onChange={(e) => setFormData({...formData, followers_count: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                       </div>
                       <div className="space-y-2">
                            <Label className="text-gray-400">Channel Link</Label>
                            <Input required placeholder="https://twitch.tv/..." value={formData.channel_url} onChange={(e) => setFormData({...formData, channel_url: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                       </div>
                    </FormSection>

                    {/* Section 2: RP Philosophy */}
                    <FormSection title="RP Experience & Philosophy" icon={<Camera size={18}/>}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-400">How long have you been roleplaying in GTA V?</Label>
                                <Input required value={formData.rp_experience} onChange={(e) => setFormData({...formData, rp_experience: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400 leading-tight block mb-2">The Ensemble Mindset: How do you balance your character's goals without overshadowing others?</Label>
                                <textarea required value={formData.ensemble_mindset} onChange={(e) => setFormData({...formData, ensemble_mindset: e.target.value})} className="w-full bg-[#1a1a1a] border-[#333] rounded-md p-4 text-sm min-h-[120px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400 leading-tight block mb-2">Strict RP Standards: How do you maintain 100% immersion for others while live?</Label>
                                <textarea required value={formData.strict_rp_standards} onChange={(e) => setFormData({...formData, strict_rp_standards: e.target.value})} className="w-full bg-[#1a1a1a] border-[#333] rounded-md p-4 text-sm min-h-[100px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">History: Any bans or warnings on servers? If so, why?</Label>
                                <Input value={formData.history_info} onChange={(e) => setFormData({...formData, history_info: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                        </div>
                    </FormSection>

                    {/* Section 3: Technical */}
                    <FormSection title="Technical & Content" icon={<Clock size={18}/>}>
                         <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-400">Sample Content (Link to VOD or Clip)</Label>
                                <Input required placeholder="https://..." value={formData.sample_content} onChange={(e) => setFormData({...formData, sample_content: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">How many hours per week do you plan to stream?</Label>
                                <Input required placeholder="20 hours" value={formData.stream_schedule} onChange={(e) => setFormData({...formData, stream_schedule: e.target.value})} className="bg-[#1a1a1a] border-[#333] h-12" />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                <input type="checkbox" required className="w-5 h-5 accent-amber-500" />
                                <Label className="text-sm text-gray-300">I am comfortable hiding/muting my screen during sensitive Staff or Metagaming moments.</Label>
                            </div>
                         </div>
                    </FormSection>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 text-lg font-black tracking-widest bg-amber-500 hover:bg-amber-600 text-black shadow-2xl shadow-amber-900/20"
                    >
                        {loading ? "PROCCESSING..." : "SUBMIT OFFICIAL APPLICATION"}
                    </Button>
                </form>
            )}
          </div>
        </div>
      </section>

      <Footer t={translations.en} />
    </div>
  );
}

function RuleBlock({ num, title, rules }: { num: string, title: string, rules: string[] }) {
    return (
        <div className="space-y-3">
            <h4 className="flex items-center gap-3 font-bold text-white uppercase tracking-tighter text-lg">
                <span className="text-amber-500">#{num}</span> {title}
            </h4>
            <ul className="space-y-2">
                {rules.map((rule, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                        <ChevronRight className="shrink-0 text-amber-500/50" size={16} />
                        {rule}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FormSection({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                    {icon}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{title}</h3>
            </div>
            {children}
            <div className="h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>
    );
}
