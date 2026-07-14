import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();
const SELECT = "*, reported:staff!reported_staff_id(id,display_name,avatar_url), investigator:staff!assigned_to(id,display_name)";
const STATUSES = ["open", "investigating", "waiting_evidence", "interview", "resolved", "rejected", "archived"];

// GET — complaint detail + timeline notes
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("complaints", "view")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data: complaint, error } = await db().from("complaints").select(SELECT).eq("id", id).single();
  if (error || !complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: notes } = await db().from("complaint_notes").select("*").eq("complaint_id", id).order("created_at", { ascending: true });
  return NextResponse.json({ complaint, notes: notes || [] });
}

// PATCH — update status / assignment / decision (complaints:edit)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("complaints", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const patch: any = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = body.status;
    if (body.status === "resolved" || body.status === "rejected") patch.resolved_at = new Date().toISOString();
  }
  if (body.assigned_to !== undefined) patch.assigned_to = body.assigned_to || null;
  if (body.decision !== undefined) patch.decision = cleanString(body.decision, { min: 0, max: 4000 }) || null;
  if (body.punishment !== undefined) patch.punishment = cleanString(body.punishment, { min: 0, max: 2000 }) || null;

  const { data, error } = await db().from("complaints").update(patch).eq("id", id).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "complaints", action: "edit", targetType: "complaint", targetId: id, summary: `Updated complaint (${body.status || "fields"})`, after: patch });
  return NextResponse.json(data);
}

// POST — add a timeline note (complaints:edit)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("complaints", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const note = cleanString(body.note, { min: 1, max: 4000 });
  if (!note) return NextResponse.json({ error: "Empty note" }, { status: 400 });

  const { data, error } = await db()
    .from("complaint_notes")
    .insert({ complaint_id: id, author: prof.actor.name, author_discord_id: prof.actor.discordId || null, note })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await db().from("complaints").update({ updated_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json(data);
}
