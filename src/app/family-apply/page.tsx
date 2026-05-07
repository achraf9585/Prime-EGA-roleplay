"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Send,
  CheckCircle,
  Shield,
  User,
  Target,
  Globe,
  ImageIcon,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { translations } from "@/components/SimpleLanguageSwitcher";
import { useSession, signIn } from "next-auth/react";

interface FamilyMember {
  discord_id: string;
  role: string;
}

export default function FamilyApplyPage() {
  const { data: session, status } = useSession();
  const [t, setT] = useState(translations.en);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    family_name: "",
    family_picture: "",
    family_nationality: "",
    family_description: "",
    family_goals: "",
    discord_id: "",
  });
  const [members, setMembers] = useState<FamilyMember[]>([{ discord_id: "", role: "Member" }]);

  useEffect(() => {
    const user = session?.user as any;
    if (user?.id) {
      setFormData((prev) => ({ ...prev, discord_id: user.id }));
    }
  }, [session]);

  const addMember = () => {
    setMembers((prev) => [...prev, { discord_id: "", role: "Member" }]);
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof FamilyMember, value: string) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return toast.error("Please login first");

    const validMembers = members.filter((m) => m.discord_id.trim() !== "");

    setLoading(true);
    try {
      const res = await fetch("/api/apply/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          family_members: validMembers,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Family Application Sent!", {
          description: "Our leadership will review your family creation request soon.",
        });
      } else {
        const err = await res.json();
        toast.error("Error", { description: err.error || "Failed to submit." });
      }
    } catch {
      toast.error("Error", { description: "Connection failed." });
    } finally {
      setLoading(false);
    }
  };

  // ─── Section header component ─────────────────────────────────────
  const SectionHeader = ({
    icon: Icon,
    label,
    step,
  }: {
    icon: any;
    label: string;
    step: number;
  }) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <Icon size={18} />
        </div>
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full text-black text-[10px] font-black flex items-center justify-center">
          {step}
        </span>
      </div>
      <h3 className="text-lg font-bold uppercase tracking-widest text-white">{label}</h3>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Header t={t} />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-[0.2em]"
          >
            <Shield size={13} /> Family Creation
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter font-orbitron"
          >
            CREATE YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              FAMILY
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-xl mx-auto"
          >
            Register a new family on EGA Roleplay. Fill in all details carefully — your application will be reviewed by leadership.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          {/* ── Sidebar ── */}
          <div className="xl:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-5">
              <div className="p-7 rounded-2xl bg-[#0e0e0e] border border-[#1e1e1e] shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 blur-[60px] rounded-full" />
                <div className="space-y-7 relative">
                  {[
                    {
                      icon: Shield,
                      title: "Family Standards",
                      items: [
                        "Minimum 3 confirmed members",
                        "Clear family identity & lore",
                        "No conflicting affiliations",
                        "Leadership must be active",
                      ],
                    },
                    {
                      icon: Target,
                      title: "What We Look For",
                      items: [
                        "Structured hierarchy & roles",
                        "Realistic goals & storylines",
                        "Professional conduct",
                        "Long-term commitment",
                      ],
                    },
                  ].map(({ icon: Icon, title, items }) => (
                    <div key={title} className="space-y-3">
                      <h2 className="text-base font-bold flex items-center gap-2">
                        <Icon className="text-orange-500" size={16} />
                        {title}
                      </h2>
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li key={item} className="flex gap-2 text-sm text-gray-400">
                            <ChevronRight className="shrink-0 text-orange-500/40 mt-0.5" size={14} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-gray-400">
                  Low-effort or duplicate family applications will be rejected and may affect your server standing.
                </p>
              </div>
            </div>
          </div>

          {/* ── Form Area ── */}
          <div className="xl:col-span-8">
            {status === "loading" ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
              </div>
            ) : !session ? (
              <div className="bg-[#0d0d0d] p-12 rounded-3xl border border-[#1a1a1a] text-center space-y-6">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                  <User className="text-orange-500" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Authentication Required</h2>
                <p className="text-gray-400 max-w-sm mx-auto">
                  Connect with Discord to submit a family creation request. This ties your application to your account.
                </p>
                <Button
                  onClick={() => signIn("discord")}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold px-8 h-12"
                >
                  Connect with Discord
                </Button>
              </div>
            ) : success ? (
              <div className="flex items-center justify-center py-24">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle className="text-green-500 w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold font-orbitron">Application Received</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Your family creation request has been submitted. Our leadership team will review it shortly.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
                  >
                    Return Home
                  </Button>
                </motion.div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-10 bg-[#0d0d0d] p-8 md:p-10 rounded-3xl border border-[#1a1a1a] shadow-2xl"
              >
                {/* ── Section 1: Identity ── */}
                <div>
                  <SectionHeader icon={Shield} label="Family Identity" step={1} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Family Name <span className="text-orange-500">*</span></Label>
                      <Input
                        required
                        placeholder="e.g. The Moretti Clan"
                        value={formData.family_name}
                        onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                        className="bg-[#151515] border-[#2a2a2a] h-12 focus:border-orange-500/50 focus:ring-0 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm flex items-center gap-1">
                        <Globe size={13} /> Nationality <span className="text-orange-500">*</span>
                      </Label>
                      <Input
                        required
                        placeholder="e.g. Italian, Moroccan, French..."
                        value={formData.family_nationality}
                        onChange={(e) => setFormData({ ...formData, family_nationality: e.target.value })}
                        className="bg-[#151515] border-[#2a2a2a] h-12 focus:border-orange-500/50 focus:ring-0 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Visual ── */}
                <div>
                  <SectionHeader icon={ImageIcon} label="Family Picture" step={2} />
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-sm">Picture URL <span className="text-gray-600">(optional)</span></Label>
                    <Input
                      placeholder="https://i.imgur.com/your-family-logo.png"
                      value={formData.family_picture}
                      onChange={(e) => setFormData({ ...formData, family_picture: e.target.value })}
                      className="bg-[#151515] border-[#2a2a2a] h-12 focus:border-orange-500/50 focus:ring-0 transition-all"
                    />
                    {formData.family_picture && (
                      <div className="mt-3 flex items-center gap-4">
                        <img
                          src={formData.family_picture}
                          alt="Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-[#2a2a2a]"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <p className="text-xs text-gray-500">Preview (if URL is valid)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Section 3: Description & Goals ── */}
                <div>
                  <SectionHeader icon={FileText} label="Description & Goals" step={3} />
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Family Description <span className="text-orange-500">*</span></Label>
                      <textarea
                        required
                        placeholder="Describe your family's background, lore, and identity on the server..."
                        value={formData.family_description}
                        onChange={(e) => setFormData({ ...formData, family_description: e.target.value })}
                        className="w-full bg-[#151515] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm min-h-[120px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Family Goals <span className="text-orange-500">*</span></Label>
                      <textarea
                        required
                        placeholder="What are your family's objectives, values, and long-term ambitions in-game?"
                        value={formData.family_goals}
                        onChange={(e) => setFormData({ ...formData, family_goals: e.target.value })}
                        className="w-full bg-[#151515] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm min-h-[120px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 4: Members ── */}
                <div>
                  <SectionHeader icon={Users} label="Family Members" step={4} />
                  <div className="space-y-3">
                    <AnimatePresence>
                      {members.map((member, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="grid grid-cols-[1fr_auto_auto] gap-3 items-center"
                        >
                          <Input
                            placeholder={`Discord ID (e.g. 123456789012345678)`}
                            value={member.discord_id}
                            onChange={(e) => updateMember(index, "discord_id", e.target.value)}
                            className="bg-[#151515] border-[#2a2a2a] h-11 focus:border-orange-500/50 focus:ring-0 transition-all font-mono text-sm"
                          />
                          <select
                            value={member.role}
                            onChange={(e) => updateMember(index, "role", e.target.value)}
                            className="h-11 bg-[#151515] border border-[#2a2a2a] rounded-md px-3 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
                          >
                            <option value="Leader">Leader</option>
                            <option value="Co-Leader">Co-Leader</option>
                            <option value="Officer">Officer</option>
                            <option value="Member">Member</option>
                          </select>
                          {members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="w-11 h-11 flex items-center justify-center rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={addMember}
                      className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors mt-1 px-1"
                    >
                      <Plus size={15} /> Add another member
                    </button>
                    <p className="text-xs text-gray-600 px-1">
                      Find Discord IDs by enabling Developer Mode in Discord → right-click a user → Copy User ID.
                    </p>
                  </div>
                </div>

                {/* ── Submit ── */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-black tracking-widest bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-2xl shadow-orange-900/20 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Family Application <Send size={18} />
                    </span>
                  )}
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
