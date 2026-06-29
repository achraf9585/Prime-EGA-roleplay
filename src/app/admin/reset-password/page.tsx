"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated. You can now log in.");
        router.push("/admin/login");
      } else {
        toast.error(data.error || "Reset failed.");
        setLoading(false);
      }
    } catch {
      toast.error("Connection failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-amber-500/30">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-[#0d0d0d] border-[#222] text-white shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
              <ShieldCheck className="text-amber-500" size={32} />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter italic uppercase">
              Reset <span className="text-amber-500">Password</span>
            </CardTitle>
            <CardDescription className="text-gray-500 mt-3 font-bold uppercase tracking-widest text-[10px]">
              Set a new clearance key
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            {!token ? (
              <p className="text-center text-red-400 text-sm">Missing reset token. Use the link from your email.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] uppercase font-black tracking-widest ml-1">New Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-[#111] border-[#222] h-12 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] uppercase font-black tracking-widest ml-1">Confirm Password</Label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="bg-[#111] border-[#222] h-12 rounded-xl" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-13 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-[0.2em] italic text-xs rounded-xl py-4 disabled:opacity-50">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
            <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock size={10} /> Single-use · expires in 1 hour
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
