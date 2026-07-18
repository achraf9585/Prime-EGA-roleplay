import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";

// GET ?from=ISO — ticket metrics + per-staff leaderboard computed from snapshots.
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("tickets", "view")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const from = new URL(req.url).searchParams.get("from");
  const db = createAdminClient();

  let q = db.from("tickets").select("*").order("opened_at", { ascending: false });
  if (from) q = q.gte("opened_at", from);
  const { data: tickets, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: staffRows } = await db.from("staff").select("discord_id, display_name, avatar_url");
  const staffMap = new Map((staffRows || []).map((s: any) => [s.discord_id, s]));

  const rows = tickets || [];
  const open = rows.filter((t) => t.status === "open");
  const closed = rows.filter((t) => t.status === "closed");

  // First-response deltas (seconds)
  const respSecs = (t: any) =>
    t.first_response_at ? Math.max(0, Math.round((new Date(t.first_response_at).getTime() - new Date(t.opened_at).getTime()) / 1000)) : null;

  const allResp = rows.map(respSecs).filter((n): n is number => n !== null);
  const allRes = closed.map((t) => t.resolution_seconds).filter((n): n is number => typeof n === "number");
  const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);

  // Per-staff aggregation
  type Agg = { discord_id: string; name: string; avatar: string | null; handled: number; firstResponses: number; respSum: number; respN: number; resSum: number; resN: number };
  const per: Record<string, Agg> = {};
  const ensure = (id: string): Agg => {
    if (!per[id]) {
      const s = staffMap.get(id);
      per[id] = { discord_id: id, name: s?.display_name || id, avatar: s?.avatar_url || null, handled: 0, firstResponses: 0, respSum: 0, respN: 0, resSum: 0, resN: 0 };
    }
    return per[id];
  };

  for (const t of rows) {
    for (const hid of t.handler_ids || []) ensure(hid).handled++;
    if (t.first_responder_discord_id) {
      const a = ensure(t.first_responder_discord_id);
      const rs = respSecs(t);
      if (rs !== null) { a.firstResponses++; a.respSum += rs; a.respN++; }
      if (t.status === "closed" && typeof t.resolution_seconds === "number") { a.resSum += t.resolution_seconds; a.resN++; }
    }
  }

  const leaderboard = Object.values(per)
    .map((a) => ({
      discord_id: a.discord_id,
      name: a.name,
      avatar: a.avatar,
      handled: a.handled,
      first_responses: a.firstResponses,
      avg_first_response_seconds: a.respN ? Math.round(a.respSum / a.respN) : null,
      avg_resolution_seconds: a.resN ? Math.round(a.resSum / a.resN) : null,
    }))
    .sort((a, b) => b.handled - a.handled);

  return NextResponse.json({
    totals: {
      total: rows.length,
      open: open.length,
      closed: closed.length,
      avg_first_response_seconds: avg(allResp),
      avg_resolution_seconds: avg(allRes),
      awaiting_response: open.filter((t) => !t.first_response_at).length,
    },
    leaderboard,
    recent: rows.slice(0, 40).map((t) => ({
      channel_name: t.channel_name,
      ticket_number: t.ticket_number,
      opener_username: t.opener_username,
      opened_at: t.opened_at,
      status: t.status,
      first_response_seconds: respSecs(t),
      resolution_seconds: t.resolution_seconds,
      handlers: (t.handler_ids || []).map((id: string) => staffMap.get(id)?.display_name || id),
    })),
  });
}
