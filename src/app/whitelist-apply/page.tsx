"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  AlertTriangle,
  Shield,
  User,
  FileText,
  ClipboardList,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizOption {
  value: string;
  text: string;
}

interface Question {
  id: string;
  category_number: number;
  category_name: string;
  question_text: string;
  options: QuizOption[];
  answerMap?: Record<string, string>; // newLetter -> originalLetter
}

interface ApplicationStatus {
  status: "none" | "pending" | "approved" | "rejected";
  quiz_score?: number;
  faction_choice?: string;
  admin_notes?: string;
  rejected_at?: string;
  created_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FACTIONS = [
  { value: "law_enforcement", label: "Law Enforcement", track: "c", icon: "🚔" },
  { value: "medical_services", label: "Medical Services / EMS", track: "b", icon: "🏥" },
  { value: "corporate", label: "Corporate & Financial", track: "a", icon: "🏦" },
  { value: "criminal", label: "Criminal Operations", track: "a", icon: "🔫" },
  { value: "civilian", label: "Civilian", track: "a", icon: "👤" },
];

const QUIZ_DURATION = 5 * 60; // 5 minutes in seconds

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;
  return (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold font-orbitron transition-all duration-300 ${
        done
          ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
          : active
          ? "border-[#8b5cf6] text-[#8b5cf6]"
          : "border-[#2a1e4a] text-[#2a1e4a]"
      }`}
    >
      {done ? <CheckCircle className="w-4 h-4" /> : step}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WhitelistApplyPage() {
  const { data: session, status: authStatus } = useSession();
  const [pageStep, setPageStep] = useState<"status" | "form" | "quiz" | "submitted">("status");
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [characterName, setCharacterName] = useState("");
  const [characterBackstory, setCharacterBackstory] = useState("");
  const [experiencePortfolio, setExperiencePortfolio] = useState("");
  const [traitsFlaws, setTraitsFlaws] = useState("");
  const [factionChoice, setFactionChoice] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const tabOutCount = useRef(0);
  const pasteCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusLoaded = useRef(false);

  // Load application status ONCE after auth resolves.
  // NextAuth re-issues the `session` object on tab refocus/refetch; without this
  // guard the effect would re-run mid-quiz, see status "none", and reset pageStep
  // back to the form — kicking the user out of the quiz.
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      setLoading(false);
      return; // not yet authenticated — allow re-run once a session appears
    }
    if (statusLoaded.current) return;
    statusLoaded.current = true;
    fetch("/api/whitelist/status")
      .then((r) => r.json())
      .then((data) => {
        setAppStatus(data);
        setLoading(false);
        if (data.status === "none") setPageStep("form");
        else setPageStep("submitted");
      })
      .catch(() => setLoading(false));
  }, [session, authStatus]);

  // Tab-out detection
  useEffect(() => {
    if (pageStep !== "quiz") return;
    const handler = () => {
      if (document.hidden) tabOutCount.current++;
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [pageStep]);

  // Paste detection on backstory textarea
  const handlePaste = useCallback(() => {
    pasteCount.current++;
  }, []);

  // Quiz timer
  useEffect(() => {
    if (pageStep !== "quiz") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleQuizSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pageStep]);

  // ── Form validation ────────────────────────────────────────────────────────

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!characterName.trim()) errors.characterName = "Character name is required.";
    if (countWords(characterBackstory) < 150)
      errors.characterBackstory = `Backstory must be at least 150 words. (${countWords(characterBackstory)}/150)`;
    if (!experiencePortfolio.trim())
      errors.experiencePortfolio = "Experience portfolio is required.";
    if (!traitsFlaws.trim()) errors.traitsFlaws = "Traits & flaws are required.";
    if (!factionChoice) errors.factionChoice = "Please select a faction.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleFormNext() {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/whitelist/questions");
      const qs: Question[] = await res.json();
      const letters = ["A", "B", "C", "D"];
      // Shuffle the option texts but keep letters in A/B/C order
      const shuffled = qs.map(q => {
        const shuffledTexts = [...q.options].sort(() => Math.random() - 0.5);
        const answerMap: Record<string, string> = {};
        const remapped = shuffledTexts.map((opt, i) => {
          const newLetter = letters[i];
          answerMap[newLetter] = opt.value; // new display letter → original correct-answer letter
          return { value: newLetter, text: opt.text };
        });
        return { ...q, options: remapped, answerMap };
      });
      // Reset quiz state for a clean run
      setAnswers({});
      setTimeLeft(QUIZ_DURATION);
      tabOutCount.current = 0;
      pasteCount.current = 0;
      setQuestions(shuffled);
      setPageStep("quiz");
    } catch {
      toast.error("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Quiz submit ───────────────────────────────────────────────────────────

  async function handleQuizSubmit(forced = false) {
    if (quizSubmitting) return;
    if (!forced) {
      const unanswered = questions.filter((q) => !answers[q.id]);
      if (unanswered.length > 0) {
        toast.error(`Please answer all ${unanswered.length} remaining questions.`);
        return;
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizSubmitting(true);

    // Translate display letters (A/B/C after shuffle) back to original DB letters for scoring
    const originalAnswers: Record<string, string> = {};
    for (const [qId, displayLetter] of Object.entries(answers)) {
      const q = questions.find(q => q.id === qId);
      originalAnswers[qId] = q?.answerMap?.[displayLetter] ?? displayLetter;
    }

    try {
      const res = await fetch("/api/whitelist/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterName,
          characterBackstory,
          experiencePortfolio,
          traitsFlaws,
          factionChoice,
          quizAnswers: originalAnswers,
          quizScore: null,
          tabOutCount: tabOutCount.current,
          pasteCount: pasteCount.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "lockout") {
          const unlock = new Date(data.unlockAt).toLocaleDateString();
          toast.error(`You are locked out until ${unlock}.`);
        } else {
          toast.error(data.error || "Submission failed.");
        }
        setQuizSubmitting(false);
        return;
      }
      setAppStatus({ status: "pending" });
      setPageStep("submitted");
    } catch {
      toast.error("Network error. Please try again.");
      setQuizSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0514] text-white font-inter">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-purple-radials opacity-60" />
        <div className="absolute inset-0 bg-vertical-purple-lines opacity-30" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a1e4a] bg-[#0a0514]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="EGA Roleplay" width={50} height={50} className="rounded-none drop-shadow-[0_0_14px_rgba(139,92,246,0.55)]" />
            <span className="font-orbitron font-bold tracking-wider text-white hidden sm:block">EGA ROLEPLAY</span>
          </a>
          <a href="/" className="text-[hsl(220_15%_72%)] hover:text-white transition-colors text-sm">← Back to Home</a>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
          <div className="header-line" />
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs font-orbitron tracking-widest mb-4">
              <Shield className="w-3 h-3" />
              WHITELIST APPLICATION
            </div>
            <h1 className="text-4xl md:text-5xl font-orbitron font-black tracking-wider text-white mb-4">
              JOIN{" "}
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] bg-clip-text text-transparent">
                EGA RP
              </span>
            </h1>
            <p className="text-[hsl(220_15%_72%)] max-w-xl mx-auto">
              Complete the whitelist application to join our immersive GTA V roleplay server. Read all questions carefully.
            </p>
          </div>

          {/* Not logged in */}
          {authStatus !== "loading" && !session && (
            <div className="bg-[#0d0a1e] border border-[#8b5cf6]/20 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h2 className="text-2xl font-orbitron font-bold mb-3">Login Required</h2>
              <p className="text-[hsl(220_15%_72%)] mb-6">You must connect your Discord account to apply for whitelist.</p>
              <button
                onClick={() => signIn("discord")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#7289DA] rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                </svg>
                Connect with Discord
              </button>
            </div>
          )}

          {/* Loading */}
          {(authStatus === "loading" || (session && loading)) && (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Application Status View */}
          {session && !loading && pageStep === "submitted" && appStatus && (
            <StatusCard status={appStatus} onReapply={() => { setAppStatus({ status: "none" }); setPageStep("form"); }} />
          )}

          {/* Application Form */}
          {session && !loading && pageStep === "form" && (
            <ApplicationForm
              characterName={characterName} setCharacterName={setCharacterName}
              characterBackstory={characterBackstory} setCharacterBackstory={setCharacterBackstory}
              experiencePortfolio={experiencePortfolio} setExperiencePortfolio={setExperiencePortfolio}
              traitsFlaws={traitsFlaws} setTraitsFlaws={setTraitsFlaws}
              factionChoice={factionChoice} setFactionChoice={setFactionChoice}
              formErrors={formErrors}
              onPaste={handlePaste}
              onNext={handleFormNext}
              loading={loading}
            />
          )}

          {/* Quiz */}
          {session && !loading && pageStep === "quiz" && (
            <QuizSection
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              timeLeft={timeLeft}
              onSubmit={() => handleQuizSubmit(false)}
              submitting={quizSubmitting}
            />
          )}

        </div>
      </main>
    </div>
  );
}

// ─── Status Card ─────────────────────────────────────────────────────────────

function StatusCard({ status, onReapply }: { status: ApplicationStatus; onReapply: () => void }) {
  const icons = {
    pending: <Clock className="w-10 h-10 text-amber-400" />,
    approved: <CheckCircle className="w-10 h-10 text-green-400" />,
    rejected: <XCircle className="w-10 h-10 text-red-400" />,
    none: null,
  };

  const colors = {
    pending: "border-amber-500/20 bg-amber-500/5",
    approved: "border-green-500/20 bg-green-500/5",
    rejected: "border-red-500/20 bg-red-500/5",
    none: "",
  };

  const st = status.status as keyof typeof icons;

  // A quiz fail = rejected with a score below the passing threshold (15/20) → 48h lockout
  const isQuizFail = st === "rejected" && status.quiz_score != null && status.quiz_score < 15;
  const lockoutMs = isQuizFail ? 48 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const titles = {
    pending: "Application Under Review",
    approved: "Congratulations! Whitelisted",
    rejected: isQuizFail ? "You Failed the Test" : "Application Rejected",
    none: "",
  };

  const lockoutDate = status.rejected_at
    ? new Date(new Date(status.rejected_at).getTime() + lockoutMs)
    : null;
  const canReapply = lockoutDate ? Date.now() > lockoutDate.getTime() : false;

  return (
    <div className={`rounded-2xl border p-10 text-center ${colors[st]}`}>
      <div className="flex justify-center mb-4">{icons[st]}</div>
      <h2 className="text-2xl font-orbitron font-bold mb-3">{titles[st]}</h2>

      {st === "pending" && (
        <p className="text-[hsl(220_15%_72%)]">Your application is being reviewed by our staff team. Check back later.</p>
      )}

      {st === "approved" && (
        <div>
          <p className="text-[hsl(220_15%_72%)] mb-4">You have been whitelisted on EGA Roleplay!</p>
          <div className="inline-block bg-[#0a0514] border border-[#8b5cf6]/30 rounded-lg px-6 py-3 font-mono text-[#8b5cf6]">
            connect cfx.re/join/egarp
          </div>
        </div>
      )}

      {st === "rejected" && (
        <div>
          {isQuizFail ? (
            <p className="text-[hsl(220_15%_72%)] mb-4">
              You scored <span className="text-red-400 font-bold">{status.quiz_score}/20</span> on the rules quiz.
              You need at least <span className="text-white font-semibold">15/20</span> to pass. You can take the test again after{" "}
              <span className="text-white font-semibold">48 hours</span>.
            </p>
          ) : (
            status.admin_notes && (
              <div className="mb-4 p-4 bg-[#0a0514] border border-red-500/20 rounded-lg text-left">
                <p className="text-xs text-red-400 font-orbitron tracking-wider mb-1">STAFF NOTES</p>
                <p className="text-[hsl(220_15%_72%)]">{status.admin_notes}</p>
              </div>
            )
          )}
          {lockoutDate && !canReapply && (
            <p className="text-amber-400 text-sm mb-4">
              You may {isQuizFail ? "retake the test" : "reapply"} after{" "}
              <span className="font-semibold">{lockoutDate.toLocaleString()}</span>
            </p>
          )}
          {canReapply && (
            <button
              onClick={onReapply}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              {isQuizFail ? "Retake the Test" : "Reapply Now"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Application Form ─────────────────────────────────────────────────────────

function ApplicationForm({
  characterName, setCharacterName,
  characterBackstory, setCharacterBackstory,
  experiencePortfolio, setExperiencePortfolio,
  traitsFlaws, setTraitsFlaws,
  factionChoice, setFactionChoice,
  formErrors, onPaste, onNext, loading,
}: any) {
  const backstoryWords = countWords(characterBackstory);

  return (
    <div className="space-y-8">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <StepIndicator step={1} current={1} />
        <div className="h-px w-16 bg-[#8b5cf6]/30" />
        <StepIndicator step={2} current={1} />
      </div>

      {/* OOC Section */}
      <section className="bg-[#0d0a1e] border border-[#8b5cf6]/15 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center">
            <User className="w-4 h-4 text-[#8b5cf6]" />
          </div>
          <h2 className="text-lg font-orbitron font-bold tracking-wider">Section A — Character Portfolio</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character Name */}
          <div>
            <label className="block text-xs font-orbitron tracking-wider text-[#8b5cf6] mb-2">
              CHARACTER NAME *
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Firstname Lastname"
              className="w-full bg-[#0a0514] border border-[#2a1e4a] hover:border-[#8b5cf6]/40 focus:border-[#8b5cf6] outline-none rounded-lg px-4 py-3 text-white placeholder-[#3a2e5a] transition-colors"
            />
            {formErrors.characterName && <p className="text-red-400 text-xs mt-1">{formErrors.characterName}</p>}
          </div>

          {/* Faction */}
          <div>
            <label className="block text-xs font-orbitron tracking-wider text-[#8b5cf6] mb-2">
              FACTION / PATH *
            </label>
            <select
              value={factionChoice}
              onChange={(e) => setFactionChoice(e.target.value)}
              className="w-full bg-[#0a0514] border border-[#2a1e4a] hover:border-[#8b5cf6]/40 focus:border-[#8b5cf6] outline-none rounded-lg px-4 py-3 text-white transition-colors appearance-none"
            >
              <option value="">Select your path...</option>
              {FACTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.icon} {f.label}
                </option>
              ))}
            </select>
            {formErrors.factionChoice && <p className="text-red-400 text-xs mt-1">{formErrors.factionChoice}</p>}
          </div>
        </div>

        {/* Backstory */}
        <div className="mt-6">
          <label className="block text-xs font-orbitron tracking-wider text-[#8b5cf6] mb-2">
            CHARACTER BACKSTORY *{" "}
            <span className={`font-normal font-inter ${backstoryWords >= 150 ? "text-green-400" : "text-amber-400"}`}>
              ({backstoryWords}/150 words minimum)
            </span>
          </label>
          <textarea
            value={characterBackstory}
            onChange={(e) => setCharacterBackstory(e.target.value)}
            onPaste={onPaste}
            rows={8}
            placeholder="Write your character's backstory here. Minimum 150 words required. Include their history, motivations, and what brought them to Los Santos..."
            className="w-full bg-[#0a0514] border border-[#2a1e4a] hover:border-[#8b5cf6]/40 focus:border-[#8b5cf6] outline-none rounded-lg px-4 py-3 text-white placeholder-[#3a2e5a] transition-colors resize-none"
          />
          {formErrors.characterBackstory && <p className="text-red-400 text-xs mt-1">{formErrors.characterBackstory}</p>}
        </div>

        {/* Experience */}
        <div className="mt-6">
          <label className="block text-xs font-orbitron tracking-wider text-[#8b5cf6] mb-2">
            ROLEPLAY EXPERIENCE PORTFOLIO *
          </label>
          <textarea
            value={experiencePortfolio}
            onChange={(e) => setExperiencePortfolio(e.target.value)}
            rows={4}
            placeholder="Describe your previous roleplay experience — servers you've played on, roles you've held, memorable scenarios..."
            className="w-full bg-[#0a0514] border border-[#2a1e4a] hover:border-[#8b5cf6]/40 focus:border-[#8b5cf6] outline-none rounded-lg px-4 py-3 text-white placeholder-[#3a2e5a] transition-colors resize-none"
          />
          {formErrors.experiencePortfolio && <p className="text-red-400 text-xs mt-1">{formErrors.experiencePortfolio}</p>}
        </div>

        {/* Traits */}
        <div className="mt-6">
          <label className="block text-xs font-orbitron tracking-wider text-[#8b5cf6] mb-2">
            CHARACTER TRAITS & FLAWS *
          </label>
          <textarea
            value={traitsFlaws}
            onChange={(e) => setTraitsFlaws(e.target.value)}
            rows={3}
            placeholder="List 3 character traits and 3 character flaws that define your roleplay character..."
            className="w-full bg-[#0a0514] border border-[#2a1e4a] hover:border-[#8b5cf6]/40 focus:border-[#8b5cf6] outline-none rounded-lg px-4 py-3 text-white placeholder-[#3a2e5a] transition-colors resize-none"
          />
          {formErrors.traitsFlaws && <p className="text-red-400 text-xs mt-1">{formErrors.traitsFlaws}</p>}
        </div>
      </section>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[hsl(220_15%_72%)]">
          <span className="text-amber-400 font-semibold">Next Step: </span>
          After submitting your portfolio, you will take a 20-question rules quiz with a{" "}
          <span className="text-white font-semibold">20-minute timer</span>. Leaving the tab or copying answers will be recorded.
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 disabled:opacity-50 rounded-xl font-orbitron font-bold tracking-wider text-white transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Proceed to Quiz <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}

// ─── Quiz Section ─────────────────────────────────────────────────────────────

function QuizSection({ questions, answers, setAnswers, timeLeft, onSubmit, submitting }: any) {
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const isUrgent = timeLeft < 180;

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <StepIndicator step={1} current={2} />
        <div className="h-px w-16 bg-[#8b5cf6]/30" />
        <StepIndicator step={2} current={2} />
      </div>

      {/* Quiz header */}
      <div className="bg-[#0d0a1e] border border-[#8b5cf6]/15 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="font-orbitron font-bold tracking-wider">Section B — Rules Quiz</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-[hsl(220_15%_72%)]">
              {answeredCount}/{questions.length} answered
            </div>
            <div className={`font-orbitron font-bold text-lg px-4 py-1 rounded-lg border ${isUrgent ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-[#8b5cf6] border-[#8b5cf6]/30 bg-[#8b5cf6]/10"}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-[#1a1030] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q: Question, idx: number) => (
        <div
          key={q.id}
          className={`bg-[#0d0a1e] border rounded-2xl p-6 transition-all duration-200 ${
            answers[q.id] ? "border-[#8b5cf6]/30" : "border-[#2a1e4a]"
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 flex items-center justify-center text-xs font-orbitron text-[#8b5cf6]">
              {idx + 1}
            </span>
            <div>
              <p className="text-xs font-orbitron tracking-wider text-[#8b5cf6]/60 mb-1">{q.category_name}</p>
              <p className="text-white">{q.question_text}</p>
            </div>
          </div>
          <div className="space-y-2 ml-10">
            {q.options.map((opt: QuizOption) => (
              <button
                key={opt.value}
                onClick={() => setAnswers((prev: any) => ({ ...prev, [q.id]: opt.value }))}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                  answers[q.id] === opt.value
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-white"
                    : "border-[#2a1e4a] hover:border-[#8b5cf6]/40 text-[hsl(220_15%_72%)] hover:text-white"
                }`}
              >
                <span className="font-orbitron text-xs text-[#8b5cf6] mr-3">{opt.value}.</span>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 disabled:opacity-50 rounded-xl font-orbitron font-bold tracking-wider text-white transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <FileText className="w-5 h-5" />
            Submit Application
          </>
        )}
      </button>
    </div>
  );
}
