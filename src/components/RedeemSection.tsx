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
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0700] to-[#0F0A04] opacity-95" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A84C]/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#B8860B]/8 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] mb-6"
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#B8860B] rounded-2xl blur opacity-15" />
          <div className="relative bg-[#100C04]/85 backdrop-blur-xl border border-[#2A1E0A] rounded-2xl p-8 shadow-2xl">
            
            <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full bg-[#180E04]/60 border border-[#2A1E0A] focus:border-[#C9A84C] rounded-xl px-5 py-4 text-center text-xl tracking-widest text-white placeholder:text-[#4A3A20] outline-none transition-all"
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
                      : "bg-gradient-to-r from-[#C9A84C] to-[#B8860B] hover:from-[#FFD700] hover:to-[#C9A84C] text-[#0F0A04]"
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
