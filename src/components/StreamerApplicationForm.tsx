"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Send, Check, AlertCircle, Loader2, Twitch, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function StreamerApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    discord_name: "",
    channel_url: "",
    platform: "Twitch",
    followers: "",
    motivation: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/apply/streamer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          followers: parseInt(formData.followers) || 0
        }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Application Sent!", { description: "Our team will review your channel soon." });
      } else {
        toast.error("Error", { description: "Failed to submit your application." });
      }
    } catch (err) {
      toast.error("Error", { description: "Connection failed." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10 space-y-4"
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
          <Check className="text-green-500 w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white">Application Received!</h3>
        <p className="text-gray-400">Thank you for your interest. We will contact you via Discord.</p>
        <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4 border-[#333]">Apply Again</Button>
      </motion.div>
    );
  }

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden" id="streamer-apply">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Video className="w-3 h-3" />
                Join Our Creators
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Become an <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">Official Creator</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                We are looking for passionate streamers and content creators to showcase the chapter 2 of EGA Roleplay. Get exclusive benefits, custom perks, and community support.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                   <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"><Twitch size={18} /></div>
                   <h4 className="text-white font-bold">Priority Access</h4>
                   <p className="text-xs text-gray-500">Skip the queue during peak hours to ensure your stream stays live.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400"><Youtube size={18} /></div>
                   <h4 className="text-white font-bold">Custom Perks</h4>
                   <p className="text-xs text-gray-500">Unique in-game badges and assets to identify you as an official partner.</p>
                </div>
              </div>
            </div>

            <Card className="bg-[#111] border-[#222] text-white p-2 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
               <CardHeader>
                 <CardTitle className="text-xl">Content Creator Application</CardTitle>
                 <CardDescription className="text-gray-500">Fill out the form below to apply for parceria.</CardDescription>
               </CardHeader>
               <CardContent>
                 <form onSubmit={handleSubmit} className="space-y-5">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Discord Username</Label>
                       <Input 
                         placeholder="Achraf#0001" 
                         value={formData.discord_name}
                         onChange={(e) => setFormData({...formData, discord_name: e.target.value})}
                         className="bg-[#1a1a1a] border-[#333] h-11"
                         required
                       />
                     </div>
                     <div className="space-y-2">
                        <Label>Platform</Label>
                        <select 
                          value={formData.platform}
                          onChange={(e) => setFormData({...formData, platform: e.target.value})}
                          className="w-full h-11 bg-[#1a1a1a] border-[#333] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option>Twitch</option>
                          <option>YouTube</option>
                          <option>Kick</option>
                          <option>TikTok</option>
                        </select>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <Label>Channel URL</Label>
                     <Input 
                       placeholder="https://twitch.tv/yourchannel" 
                       value={formData.channel_url}
                       onChange={(e) => setFormData({...formData, channel_url: e.target.value})}
                       className="bg-[#1a1a1a] border-[#333] h-11"
                       required
                     />
                   </div>

                   <div className="space-y-2">
                     <Label>Average Followers / Subs</Label>
                     <Input 
                       type="number"
                       placeholder="1500" 
                       value={formData.followers}
                       onChange={(e) => setFormData({...formData, followers: e.target.value})}
                       className="bg-[#1a1a1a] border-[#333] h-11"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label>Why join EGA?</Label>
                     <textarea 
                       placeholder="Tell us about your content..." 
                       value={formData.motivation}
                       onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                       className="w-full bg-[#1a1a1a] border-[#333] rounded-md px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-purple-500"
                       required
                     />
                   </div>

                   <Button 
                     type="submit" 
                     className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white shadow-xl shadow-purple-900/10"
                     disabled={loading}
                   >
                     {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Application"}
                   </Button>
                 </form>
               </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
}

// Minimal Card components if not globally available, otherwise import normally
function Card({ children, className }: any) {
  return <div className={`rounded-2xl border ${className}`}>{children}</div>;
}
function CardHeader({ children, className }: any) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}
function CardTitle({ children, className }: any) {
  return <h3 className={`font-bold leading-none tracking-tight ${className}`}>{children}</h3>;
}
function CardDescription({ children, className }: any) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}
function CardContent({ children, className }: any) {
  return <div className={`p-6 pt-4 ${className}`}>{children}</div>;
}
