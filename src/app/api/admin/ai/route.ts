import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";

const TRACKING_START = new Date(2026, 6, 12, 0, 0, 0, 0).getTime();
const DAY_MS = 86_400_000;

// Report types the assistant can produce. Each maps to a focused instruction.
const REPORTS: Record<string, { label: string; instruction: string }> = {
  executive_summary: {
    label: "Executive Summary",
    instruction:
      "Write a concise executive summary of the current state of the staff team for the owner. Cover activity, workload, discipline, and anything that needs attention. 4–6 short paragraphs or bullet groups.",
  },
  weekly_report: {
    label: "Weekly Report",
    instruction:
      "Write a weekly operations report covering duty activity, complaint throughput, promotions, discipline, and schedule coverage over the tracked period. Highlight trends and call out any staff who stand out (positively or negatively). Use clear sections.",
  },
  risk_analysis: {
    label: "Risk Analysis",
    instruction:
      "Produce a risk analysis of the staff team. Identify staff or operational areas that carry risk — inactivity, high complaint exposure, stale investigations, coverage gaps, disciplinary patterns. Rank risks and explain the evidence behind each. Recommend mitigations, but do NOT make disciplinary decisions.",
  },
  promotion_recommendations: {
    label: "Promotion & Training Recommendations",
    instruction:
      "Recommend which staff (if any) look ready for promotion or would benefit from training, based strictly on the data provided (duty activity, reliability, conduct, tenure). For each recommendation cite the specific numbers that support it. These are advisory only — final decisions rest with leadership. If the data is insufficient to recommend anyone, say so plainly rather than inventing candidates.",
  },
};

async function gatherContext(db: ReturnType<typeof createAdminClient>) {
  const now = Date.now();
  const since = new Date(TRACKING_START).toISOString();

  const [{ data: staffRows }, { data: sessions }, { data: complaints }, { data: promotions }, { data: discipline }, { data: assignments }] =
    await Promise.all([
      db.from("staff").select("display_name, status, join_date, discord_id, rank:ranks(name, level), department:departments(name)"),
      db.from("duty_sessions").select("discord_id, discord_username, started_at, ended_at, duration_seconds, staff:staff(display_name)").gte("started_at", since).limit(5000),
      db.from("complaints").select("status, created_at, updated_at"),
      db.from("promotions").select("status, created_at, staff:staff(display_name), from_rank:ranks!promotions_from_rank_id_fkey(name), to_rank:ranks!promotions_to_rank_id_fkey(name)"),
      db.from("discipline_records").select("type, status, expires_at, staff:staff(display_name)"),
      db.from("schedule_assignments").select("day_of_week, slot_hour"),
    ]);

  // Per-staff duty totals
  const dutyByStaff: Record<string, { name: string; seconds: number; sessions: number }> = {};
  for (const s of sessions || []) {
    let secs = s.duration_seconds || 0;
    if (!s.ended_at) secs = Math.round((now - new Date(s.started_at).getTime()) / 1000);
    const name = (s.staff as any)?.display_name || s.discord_username || s.discord_id;
    if (!dutyByStaff[s.discord_id]) dutyByStaff[s.discord_id] = { name, seconds: 0, sessions: 0 };
    dutyByStaff[s.discord_id].seconds += secs;
    dutyByStaff[s.discord_id].sessions += 1;
  }

  const staffSummary = (staffRows || []).map((s: any) => {
    const duty = s.discord_id ? dutyByStaff[s.discord_id] : null;
    return {
      name: s.display_name,
      status: s.status,
      rank: s.rank?.name || null,
      department: s.department?.name || null,
      joined: s.join_date,
      duty_hours: duty ? Math.round((duty.seconds / 3600) * 10) / 10 : 0,
      duty_sessions: duty ? duty.sessions : 0,
    };
  });

  const complaintsByStatus: Record<string, number> = {};
  for (const c of complaints || []) complaintsByStatus[c.status] = (complaintsByStatus[c.status] || 0) + 1;

  const SLOTS = [20, 21, 22, 23, 0, 1];
  const covered = new Set((assignments || []).map((a) => `${a.day_of_week}-${a.slot_hour}`));
  let gaps = 0;
  for (let d = 0; d < 7; d++) for (const h of SLOTS) if (!covered.has(`${d}-${h}`)) gaps++;

  return {
    tracking_start: since,
    generated_at: new Date().toISOString(),
    staff_count: { total: staffSummary.length, active: staffSummary.filter((s) => s.status === "active").length },
    staff: staffSummary,
    complaints: { by_status: complaintsByStatus, total: complaints?.length || 0 },
    promotions: (promotions || []).map((p: any) => ({ staff: p.staff?.display_name, from: p.from_rank?.name || null, to: p.to_rank?.name || null, status: p.status })),
    discipline: (discipline || []).map((d: any) => ({ staff: d.staff?.display_name, type: d.type, status: d.status, expires_at: d.expires_at })),
    schedule: { total_slots: 7 * SLOTS.length, uncovered_slots: gaps },
  };
}

export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI Assistant is not configured. Add GEMINI_API_KEY to the environment (free key at aistudio.google.com)." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const type = String(body.type || "");
  const report = REPORTS[type];
  if (!report) return NextResponse.json({ error: "Unknown report type" }, { status: 400 });

  const db = createAdminClient();
  const context = await gatherContext(db);

  const system =
    "You are the analytics assistant for a FiveM roleplay server's staff operations team. " +
    "You are given a JSON snapshot of REAL staff data. Base every statement strictly on this data — never invent names, numbers, or events. " +
    "If the data is thin or a period is too short to judge, say so honestly instead of guessing. " +
    "You provide analysis and recommendations only; you never make or announce disciplinary or personnel decisions — those belong to leadership. " +
    "Write in clear plain text with short sections and bullet points where useful. Do not use tables. Keep it focused and skimmable.";

  const userContent =
    `${report.instruction}\n\n` +
    `Data snapshot (JSON):\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\``;

  // Google Gemini (free tier) — Generative Language API.
  const MODEL = "gemini-flash-latest";
  let text = "";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.4 },
        }),
      },
    );
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `AI request failed (${res.status}).`, detail: errText.slice(0, 500) }, { status: 502 });
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    text = parts.map((p: any) => p.text || "").join("").trim();
    if (!text) {
      const blocked = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
      return NextResponse.json({ error: `AI returned no content${blocked ? ` (${blocked})` : ""}.` }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to reach the AI service.", detail: String(e?.message || e) }, { status: 502 });
  }

  await writeAudit(prof.actor, {
    module: "audit",
    action: "export",
    targetType: "ai_report",
    targetId: type,
    summary: `Generated AI report: ${report.label}`,
  });

  return NextResponse.json({ type, label: report.label, text, generatedAt: new Date().toISOString() });
}
