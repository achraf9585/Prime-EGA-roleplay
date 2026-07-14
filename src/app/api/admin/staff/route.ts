import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";
import { fetchDiscordAvatar } from "@/lib/discord";

const db = () => createAdminClient();
const SELECT = "*, rank:ranks(id,name,level,color), department:departments(id,name,color)";
const STATUSES = ["active", "inactive", "on_leave", "suspended"];

// GET — staff directory (staff:view)
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await db().from("staff").select(SELECT).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

function sanitizeStaff(body: any) {
  const display_name = cleanString(body.display_name, { min: 2, max: 100 });
  if (!display_name) return { error: "Display name is required." };
  const status = STATUSES.includes(body.status) ? body.status : "active";
  return {
    row: {
      display_name,
      discord_id: cleanString(body.discord_id, { min: 0, max: 40 }) || null,
      email: cleanString(body.email, { min: 0, max: 160 }) || null,
      rank_id: body.rank_id || null,
      department_id: body.department_id || null,
      join_date: body.join_date || undefined,
      status,
      notes: cleanString(body.notes, { min: 0, max: 5000 }) || null,
    },
  };
}

// POST — create staff (staff:create)
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const s = sanitizeStaff(body);
  if ("error" in s) return NextResponse.json({ error: s.error }, { status: 400 });

  // Auto-fetch avatar from Discord
  const avatar_url = s.row.discord_id ? await fetchDiscordAvatar(s.row.discord_id) : null;

  const { data, error } = await db().from("staff").insert({ ...s.row, avatar_url }).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "staff", action: "create", targetType: "staff", targetId: data.id, summary: `Added staff ${data.display_name}`, after: data });
  return NextResponse.json(data);
}

// PATCH — update staff (staff:edit)
export async function PATCH(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const s = sanitizeStaff(body);
  if ("error" in s) return NextResponse.json({ error: s.error }, { status: 400 });

  // Refresh avatar from Discord (in case the ID changed or the pfp updated)
  const avatar_url = s.row.discord_id ? await fetchDiscordAvatar(s.row.discord_id) : null;

  const { data: before } = await db().from("staff").select("*").eq("id", body.id).single();
  const { data, error } = await db().from("staff").update({ ...s.row, avatar_url, updated_at: new Date().toISOString() }).eq("id", body.id).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "staff", action: "edit", targetType: "staff", targetId: body.id, summary: `Edited staff ${data.display_name}`, before, after: data });
  return NextResponse.json(data);
}

// DELETE — remove staff (staff:delete)
export async function DELETE(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "delete")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await db().from("staff").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "staff", action: "delete", targetType: "staff", targetId: id, summary: "Removed staff member" });
  return NextResponse.json({ success: true });
}
