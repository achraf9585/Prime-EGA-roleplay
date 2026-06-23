import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { cleanString, wordCount } from "@/lib/validation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const QUIZ_PASS_THRESHOLD = 15; // out of 20
const QUIZ_FAIL_LOCKOUT_MS = 48 * 60 * 60 * 1000; // 48 hours
const ADMIN_REJECT_LOCKOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const VALID_FACTIONS = ["law_enforcement", "medical_services", "corporate", "criminal", "civilian"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const discordId = (session.user as any).id;
  if (!discordId) {
    return NextResponse.json({ error: "Discord account required" }, { status: 401 });
  }

  // Rate limit: max 5 submissions per 10 minutes per user
  const rl = rateLimit(`wl-apply:${discordId}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await req.json();
  const {
    characterName,
    characterBackstory,
    experiencePortfolio,
    traitsFlaws,
    factionChoice,
    quizAnswers,
    tabOutCount,
    pasteCount,
  } = body;

  // Server-side validation — never trust client lengths/values
  const cName = cleanString(characterName, { min: 2, max: 100 });
  const cBackstory = cleanString(characterBackstory, { min: 1, max: 10000 });
  const cExperience = cleanString(experiencePortfolio, { min: 1, max: 5000 });
  const cTraits = cleanString(traitsFlaws, { min: 1, max: 3000 });

  if (!cName || !cBackstory || !cExperience || !cTraits) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }
  if (wordCount(cBackstory) < 150) {
    return NextResponse.json({ error: "Backstory must be at least 150 words." }, { status: 400 });
  }
  if (!VALID_FACTIONS.includes(factionChoice)) {
    return NextResponse.json({ error: "Invalid faction choice." }, { status: 400 });
  }
  // quizAnswers must be a plain object of at most 20 string→string entries
  if (typeof quizAnswers !== "object" || quizAnswers === null || Array.isArray(quizAnswers)) {
    return NextResponse.json({ error: "Invalid quiz answers." }, { status: 400 });
  }
  if (Object.keys(quizAnswers).length > 20) {
    return NextResponse.json({ error: "Too many quiz answers." }, { status: 400 });
  }
  const safeTabOut = Number.isFinite(tabOutCount) ? Math.max(0, Math.min(10000, Math.trunc(tabOutCount))) : 0;
  const safePaste = Number.isFinite(pasteCount) ? Math.max(0, Math.min(10000, Math.trunc(pasteCount))) : 0;

  const discordUsername = session.user.name || "";
  // Extract avatar hash from Discord image URL
  const discordAvatar = session.user.image || "";

  // Check for existing application
  const { data: existing } = await supabase
    .from("whitelist_applications")
    .select("id, status, rejected_at, quiz_score")
    .eq("discord_id", discordId)
    .single();

  if (existing) {
    if (existing.status === "pending" || existing.status === "approved") {
      return NextResponse.json(
        { error: "You already have an active application." },
        { status: 400 }
      );
    }
    // Rejected: enforce lockout — 48h for a failed quiz, 7 days for an admin rejection
    if (existing.status === "rejected" && existing.rejected_at) {
      const rejectedAt = new Date(existing.rejected_at).getTime();
      const now = Date.now();
      const wasQuizFail = existing.quiz_score != null && existing.quiz_score < QUIZ_PASS_THRESHOLD;
      const lockoutMs = wasQuizFail ? QUIZ_FAIL_LOCKOUT_MS : ADMIN_REJECT_LOCKOUT_MS;
      if (now - rejectedAt < lockoutMs) {
        const unlockAt = new Date(rejectedAt + lockoutMs);
        return NextResponse.json(
          { error: "lockout", unlockAt: unlockAt.toISOString() },
          { status: 403 }
        );
      }
    }
    // Delete old rejected application and allow resubmit
    await supabase.from("whitelist_applications").delete().eq("id", existing.id);
  }

  // Calculate score server-side using correct answers from DB
  const questionIds = Object.keys(quizAnswers);
  let computedScore = 0;
  if (questionIds.length > 0) {
    const { data: correctAnswers } = await supabase
      .from("whitelist_questions")
      .select("id, correct_answer")
      .in("id", questionIds);
    if (correctAnswers) {
      for (const q of correctAnswers) {
        if (quizAnswers[q.id] === q.correct_answer) computedScore++;
      }
    }
  }

  // Auto-reject if the candidate failed the quiz (below the pass threshold)
  const failedQuiz = computedScore < QUIZ_PASS_THRESHOLD;
  const nowIso = new Date().toISOString();

  const { error } = await supabase.from("whitelist_applications").insert({
    discord_id: discordId,
    discord_username: discordUsername,
    discord_avatar: discordAvatar,
    character_name: cName,
    character_backstory: cBackstory,
    experience_portfolio: cExperience,
    traits_flaws: cTraits,
    faction_choice: factionChoice,
    quiz_score: computedScore,
    quiz_answers: quizAnswers,
    tab_out_count: safeTabOut,
    paste_count: safePaste,
    status: failedQuiz ? "rejected" : "pending",
    admin_notes: failedQuiz
      ? `Auto-rejected: failed the rules quiz (${computedScore}/20). You may retake the test after 48 hours.`
      : null,
    rejected_at: failedQuiz ? nowIso : null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, failedQuiz, score: computedScore });
}
