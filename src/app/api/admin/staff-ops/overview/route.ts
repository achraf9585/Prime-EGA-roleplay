import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";

// GET ?today=ISO&week=ISO — aggregated KPIs for the Staff Operations overview.
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = Date.now();
  const todayStart = searchParams.get("today") || new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const weekStart = searchParams.get("week") || new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const db = createAdminClient();

  // Staff counts
  const { data: staffRows } = await db.from("staff").select("status");
  const staffTotal = staffRows?.length || 0;
  const staffActive = (staffRows || []).filter((s) => s.status === "active").length;

  // Duty (this week window)
  const { data: sessions } = await db
    .from("duty_sessions")
    .select("discord_id, discord_username, started_at, ended_at, duration_seconds, staff:staff(display_name, avatar_url)")
    .gte("started_at", weekStart)
    .limit(3000);

  let onDutyNow = 0, todaySeconds = 0, weekSeconds = 0;
  const perStaff: Record<string, { name: string; avatar: string | null; seconds: number }> = {};
  const todayMs = new Date(todayStart).getTime();
  for (const s of sessions || []) {
    let secs = s.duration_seconds || 0;
    if (!s.ended_at) { onDutyNow++; secs = Math.round((now - new Date(s.started_at).getTime()) / 1000); }
    weekSeconds += secs;
    if (new Date(s.started_at).getTime() >= todayMs) todaySeconds += secs;
    const name = (s.staff as any)?.display_name || s.discord_username || s.discord_id;
    if (!perStaff[s.discord_id]) perStaff[s.discord_id] = { name, avatar: (s.staff as any)?.avatar_url || null, seconds: 0 };
    perStaff[s.discord_id].seconds += secs;
  }
  // Count currently-open sessions across all time (not just this week)
  const { count: openCount } = await db.from("duty_sessions").select("id", { count: "exact", head: true }).is("ended_at", null);
  onDutyNow = openCount || onDutyNow;

  const topDuty = Object.values(perStaff).sort((a, b) => b.seconds - a.seconds).slice(0, 5);

  // Complaints
  const { data: complaints } = await db.from("complaints").select("status");
  const cByStatus: Record<string, number> = {};
  for (const c of complaints || []) cByStatus[c.status] = (cByStatus[c.status] || 0) + 1;
  const openComplaints = (cByStatus.open || 0) + (cByStatus.investigating || 0) + (cByStatus.waiting_evidence || 0) + (cByStatus.interview || 0);

  // Promotions pending
  const { count: pendingPromotions } = await db.from("promotions").select("id", { count: "exact", head: true }).eq("status", "pending");

  // Active discipline (status active & not expired)
  const { data: disc } = await db.from("discipline_records").select("status, expires_at").eq("status", "active");
  const activeDiscipline = (disc || []).filter((d) => !d.expires_at || new Date(d.expires_at).getTime() > now).length;

  return NextResponse.json({
    staff: { total: staffTotal, active: staffActive },
    duty: { onDutyNow, todaySeconds, weekSeconds, top: topDuty },
    complaints: { open: openComplaints, total: complaints?.length || 0, byStatus: cByStatus },
    promotions: { pending: pendingPromotions || 0 },
    discipline: { active: activeDiscipline },
  });
}
