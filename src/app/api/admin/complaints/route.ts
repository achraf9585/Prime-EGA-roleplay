import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();
const SELECT = "*, reported:staff!reported_staff_id(id,display_name,avatar_url), investigator:staff!assigned_to(id,display_name)";

// GET ?status= — list complaints (newest first)
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("complaints", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = new URL(req.url).searchParams.get("status");
  let q = db().from("complaints").select(SELECT).order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — file a complaint
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("complaints", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = cleanString(body.title, { min: 2, max: 200 });
  const description = cleanString(body.description, { min: 2, max: 8000 });
  if (!title || !description) return NextResponse.json({ error: "Title and description are required" }, { status: 400 });

  const row = {
    title,
    description,
    reporter: cleanString(body.reporter, { min: 0, max: 200 }) || null,
    reported_staff_id: body.reported_staff_id || null,
    reported_staff_text: cleanString(body.reported_staff_text, { min: 0, max: 200 }) || null,
    evidence: cleanString(body.evidence, { min: 0, max: 4000 }) || null,
    created_by: prof.actor.name,
    created_by_discord_id: prof.actor.discordId || null,
  };
  const { data, error } = await db().from("complaints").insert(row).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "complaints", action: "create", targetType: "complaint", targetId: data.id, summary: `Filed complaint: ${title.slice(0, 80)}`, after: data });
  return NextResponse.json(data);
}
