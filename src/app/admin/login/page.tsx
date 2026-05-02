"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const auth = localStorage.getItem("ega_admin_auth");
    if (auth) {
      router.push("/admin/codes");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We test the credentials against the stats API (the safest way to check if authorized)
      const res = await fetch("/api/admin/stats", {
        headers: {
          "x-admin-email": email,
          "x-admin-password": password,
        },
      });

      if (res.ok) {
        localStorage.setItem("ega_admin_auth", JSON.stringify({ email, password }));
        toast.success("Access Granted. Synchronizing...");
        router.push("/admin/codes");
      } else {
        toast.error("Authorization Denied: Invalid Credentials");
        setLoading(false); // Reset the button
      }
    } catch (err) {
      toast.error("HQ Connection Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-amber-500/30">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-[#0d0d0d] border-[#222] text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          
          <CardHeader className="text-center pt-10 pb-6">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            >
              <ShieldCheck className="text-amber-500" size={32} />
            </motion.div>
            <CardTitle className="text-3xl font-black tracking-tighter italic uppercase underline decoration-amber-500/50 underline-offset-8">
              Admin <span className="text-amber-500">HQ</span>
            </CardTitle>
            <CardDescription className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-[10px]">
              Secure Operational Interface v2.0
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-400 text-[10px] uppercase font-black tracking-widest ml-1">Operator ID</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@egaroleplay.com" 
                  className="bg-[#111] border-[#222] h-12 rounded-xl focus:ring-1 focus:ring-amber-500/50 transition-all font-medium"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-[10px] uppercase font-black tracking-widest ml-1">Clearance Key</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="bg-[#111] border-[#222] h-12 rounded-xl focus:ring-1 focus:ring-amber-500/50 transition-all"
                  required 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-[0.2em] italic text-xs rounded-xl shadow-2xl shadow-amber-900/20 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Zap className="animate-pulse" size={14} /> 
                        Authenticating...
                    </div>
                ) : "Establish Secure Link"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock size={10} /> Encryption Active: AES-256
                </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
