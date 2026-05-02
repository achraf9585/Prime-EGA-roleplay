"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Send, Check, Loader2, Shield, Target, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function FamilyApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    ic_name: "",
    age: "",
    experience: "",
    backstory: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/apply/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Application Sent!", { description: "Our family leadership will review your application soon." });
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
        className="text-center py-20 space-y-6"
      >
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/50">
          <Check className="text-amber-500 w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-white font-orbitron">Application Received!</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Your journey to joining the EGA family has begun. We will review your application carefully and contact you.
          </p>
        </div>
        <Button 
          onClick={() => setSuccess(false)} 
          variant="outline" 
          className="mt-4 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
        >
          Submit Another Application
        </Button>
      </motion.div>
    );
  }

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden" id="family-apply">
      {/* Premium Visual Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold uppercase tracking-[0.2em]"
            >
              <Users className="w-4 h-4" />
              Recruitment Open
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white leading-tight font-orbitron"
            >
              EGA ROLEPLAY <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
                OFFICIAL FAMILY APPLICATION
              </span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              We are officially opening applications to join our family on EGA RP. 
              Join a structured and disciplined team focused on high-quality roleplay.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Shield className="text-amber-500 w-5 h-5" />
                    About Us
                  </h3>
                  <p className="text-gray-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-4">
                    "We are a structured and disciplined family focused on delivering high-quality, immersive roleplay. Our goal is to build strong, realistic storylines while maintaining professionalism and respect within the community."
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="text-amber-500 w-5 h-5" />
                    We Are Looking For
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Serious and mature roleplayers",
                      "Active members committed to long-term RP",
                      "Individuals who understand and respect server rules",
                      "Players capable of contributing to engaging scenarios"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-400">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="text-amber-500 w-5 h-5" />
                    Requirements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Consistent activity",
                      "Functional microphone",
                      "No Fail RP / No Troll",
                      "Ability to follow leadership"
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7"
            >
              <Card className="bg-[#111] border-[#222] text-white p-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-orbitron tracking-tight">Application Form</CardTitle>
                  <CardDescription className="text-gray-500">
                    Submit your details carefully. Only serious candidates will be considered.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300 font-medium">IC Name</Label>
                        <Input 
                          placeholder="John Doe" 
                          value={formData.ic_name}
                          onChange={(e) => setFormData({...formData, ic_name: e.target.value})}
                          className="bg-[#1a1a1a] border-[#333] h-12 focus:border-amber-500/50 transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300 font-medium">Age</Label>
                        <Input 
                          type="number"
                          placeholder="21" 
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          className="bg-[#1a1a1a] border-[#333] h-12 focus:border-amber-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Previous RP Experience</Label>
                      <textarea 
                        placeholder="Tell us about the servers you played on and your roles..." 
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="w-full bg-[#1a1a1a] border-[#333] rounded-md px-3 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Detailed Character Backstory</Label>
                      <textarea 
                        placeholder="Provide a compelling backstory for your character..." 
                        value={formData.backstory}
                        onChange={(e) => setFormData({...formData, backstory: e.target.value})}
                        className="w-full bg-[#1a1a1a] border-[#333] rounded-md px-3 py-3 text-sm min-h-[150px] focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                        required
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 flex gap-3 text-xs text-red-400">
                      <div className="pt-0.5"><Users size={14} /></div>
                      <p>⚠️ Applications are reviewed carefully. Low effort or troll applications will be instantly rejected and may affect your server standing.</p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-black text-white shadow-xl shadow-amber-900/20 text-lg uppercase tracking-wider"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                        <span className="flex items-center gap-2">
                          Submit Application <Send className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

// Minimal Card components (using the same pattern as Streamer form for consistency)
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
