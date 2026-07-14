import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";

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
  if (staff.discord_id) {
    const { data: sessions } = await supabase
      .from("duty_sessions")
      .select("started_at, ended_at, duration_seconds, auto_closed")
      .eq("discord_id", staff.discord_id)
      .order("started_at", { ascending: false })
      .limit(200);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const s of sessions || []) {
      duty.sessionCount++;
      duty.totalSeconds += s.duration_seconds || 0;
      if (new Date(s.started_at).getTime() >= weekAgo) duty.last7dSeconds += s.duration_seconds || 0;
      if (!s.ended_at) duty.onDutyNow = true;
    }
    if (sessions && sessions[0]) duty.lastOnDuty = sessions[0].started_at;
    duty.recent = (sessions || []).slice(0, 15);
  }

  return NextResponse.json({ staff, duty });
}
