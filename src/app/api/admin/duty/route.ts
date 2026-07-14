import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";

const SELECT = "*, staff:staff(id, display_name, avatar_url, rank:ranks(name,color))";

// GET — duty sessions in a date range + who is on duty now + per-person totals.
// Query params: from (ISO), to (ISO). Defaults to last 7 days.
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("duty", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") || new Date().toISOString();
  const from = searchParams.get("from") || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createAdminClient();

  // Sessions that overlap the range (started within it)
  const { data: sessions, error } = await supabase
    .from("duty_sessions")
    .select(SELECT)
    .gte("started_at", from)
    .lte("started_at", to)
    .order("started_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Currently on duty (open sessions, regardless of range)
  const { data: onDuty } = await supabase
    .from("duty_sessions")
    .select(SELECT)
    .is("ended_at", null)
    .order("started_at", { ascending: false });

  // Per-person totals within the range
  const totals: Record<string, { discord_id: string; name: string; avatar: string | null; seconds: number; sessions: number }> = {};
  for (const s of sessions || []) {
    const key = s.discord_id;
    const name = s.staff?.display_name || s.discord_username || s.discord_id;
    if (!totals[key]) totals[key] = { discord_id: key, name, avatar: s.staff?.avatar_url || null, seconds: 0, sessions: 0 };
    totals[key].seconds += s.duration_seconds || 0;
    totals[key].sessions += 1;
  }

  return NextResponse.json({
    sessions: sessions || [],
    onDuty: onDuty || [],
    totals: Object.values(totals).sort((a, b) => b.seconds - a.seconds),
    range: { from, to },
  });
}
