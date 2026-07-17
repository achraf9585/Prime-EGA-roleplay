import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { computePerformance } from "@/lib/performance";

// Actual datetime of a schedule slot in the current week (Mon-start; 0/1 → next day)
function slotDateTime(dayOfWeek: number, slotHour: number): Date {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOfWeek + (slotHour < 12 ? 1 : 0));
  d.setHours(slotHour, 0, 0, 0);
  return d;
}

const SELECT = "*, rank:ranks(id,name,level,color), department:departments(id,name,color)";

// GET /api/admin/staff/[id] — full profile: identity + duty aggregates + recent sessions
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: staff, error } = await supabase.from("staff").select(SELECT).eq("id", id).single();
  if (error || !staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Duty aggregates — match by discord_id (sessions may predate the staff row's link)
  let duty = { totalSeconds: 0, sessionCount: 0, last7dSeconds: 0, lastOnDuty: null as string | null, onDutyNow: false, recent: [] as any[] };
  let sessions: any[] = [];
  if (staff.discord_id) {
    const res = await supabase
      .from("duty_sessions")
      .select("started_at, ended_at, duration_seconds, auto_closed")
      .eq("discord_id", staff.discord_id)
      .order("started_at", { ascending: false })
      .limit(200);
    sessions = res.data || [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const s of sessions) {
      duty.sessionCount++;
      duty.totalSeconds += s.duration_seconds || 0;
      if (new Date(s.started_at).getTime() >= weekAgo) duty.last7dSeconds += s.duration_seconds || 0;
      if (!s.ended_at) duty.onDutyNow = true;
    }
    if (sessions[0]) duty.lastOnDuty = sessions[0].started_at;
    duty.recent = sessions.slice(0, 15);
  }

  // ── Performance inputs ──
  const now = Date.now();
  // Discipline
  const { data: disc } = await supabase.from("discipline_records").select("type, status, expires_at").eq("staff_id", id).eq("status", "active");
  const activeDisc = (disc || []).filter((d) => !d.expires_at || new Date(d.expires_at).getTime() > now);
  const finalOrWorse = activeDisc.filter((d) => ["final_warning", "suspension", "demotion", "termination"].includes(d.type)).length;
  // Open complaints against them
  const { count: openComplaints } = await supabase.from("complaints").select("id", { count: "exact", head: true }).eq("reported_staff_id", id).in("status", ["open", "investigating", "waiting_evidence", "interview"]);
  // Schedule compliance this week
  const { data: assigns } = await supabase.from("schedule_assignments").select("day_of_week, slot_hour").eq("staff_id", id);
  const GRACE = 30 * 60 * 1000;
  let scheduledPast = 0, scheduledCovered = 0;
  for (const a of assigns || []) {
    const start = slotDateTime(a.day_of_week, a.slot_hour).getTime();
    const end = start + 3600_000;
    if (end > now) continue; // upcoming
    scheduledPast++;
    const covered = sessions.some((s) => {
      const st = new Date(s.started_at).getTime();
      const en = s.ended_at ? new Date(s.ended_at).getTime() : now;
      return st < end + GRACE && en > start - GRACE;
    });
    if (covered) scheduledCovered++;
  }

  const performance = computePerformance({
    last7dSeconds: duty.last7dSeconds,
    scheduledPast,
    scheduledCovered,
    activeDiscipline: activeDisc.length,
    finalOrWorse,
    openComplaints: openComplaints || 0,
  });

  return NextResponse.json({ staff, duty, performance });
}
