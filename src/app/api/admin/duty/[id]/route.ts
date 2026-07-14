import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";

const db = () => createAdminClient();

// PATCH — correct a session's end time (or close it now). Body: { ended_at?: ISO, close_now?: bool }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("duty", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const { data: session } = await db().from("duty_sessions").select("started_at").eq("id", id).single();
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const endIso = body.close_now ? new Date().toISOString() : body.ended_at;
  if (!endIso) return NextResponse.json({ error: "Missing ended_at" }, { status: 400 });

  const start = new Date(session.started_at).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(end) || end < start) return NextResponse.json({ error: "End must be after start." }, { status: 400 });

  const { data, error } = await db()
    .from("duty_sessions")
    .update({ ended_at: endIso, duration_seconds: Math.round((end - start) / 1000), auto_closed: false })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "duty", action: "edit", targetType: "duty_session", targetId: id, summary: "Corrected duty session end time" });
  return NextResponse.json(data);
}

// DELETE — remove a bogus session
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("duty", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await db().from("duty_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "duty", action: "delete", targetType: "duty_session", targetId: id, summary: "Deleted duty session" });
  return NextResponse.json({ success: true });
}
