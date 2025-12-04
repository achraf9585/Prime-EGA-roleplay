"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RedeemSectionProps {
  t: any;
}

export default function RedeemSection({ t }: RedeemSectionProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const handleRedeem = async () => {
    if (!code.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Code redeemed successfully!");
        setCode("");
      } else {
        setStatus("error");
        setMessage(data.error || "Invalid code");
      }
    } catch (e) {
      setStatus("error");
      setMessage("Something went wrong");
    }
    
    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#020617] opacity-90" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-6"
          >
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {t.redeem?.badge || "Rewards"}
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.redeem?.title || "Redeem Your Code"}
          </h2>
          <p className="text-lg text-slate-400">
            {t.redeem?.subtitle || "Enter your exclusive code to unlock special rewards in-game."}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-20" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            
            <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-slate-800/50 border border-slate-600 focus:border-orange-500 rounded-xl px-5 py-4 text-center text-xl tracking-widest text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                </div>

                <Button
                  onClick={handleRedeem}
                  disabled={status === "loading" || !code}
                  className={`w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 ${
                    status === "success" 
                      ? "bg-green-500 hover:bg-green-600" 
                      : status === "error"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                  }`}
                >
                  {status === "loading" ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : status === "success" ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-6 h-6" />
                      <span>Redeemed!</span>
                    </div>
                  ) : status === "error" ? (
                    <div className="flex items-center gap-2">
                      <X className="w-6 h-6" />
                      <span>{message}</span>
                    </div>
                  ) : (
                    "Redeem Code"
                  )}
                </Button>

                {status === "success" && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-center text-sm"
                  >
                    {message}
                  </motion.p>
                )}
              </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
