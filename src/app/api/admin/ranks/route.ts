import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();

// GET — list ranks (any staff-ops viewer with staff:view; super-admin always)
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await db().from("ranks").select("*").order("level", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create a rank (staff:create)
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = cleanString(body.name, { min: 2, max: 60 });
  if (!name) return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const row = {
    name,
    level: Number.isFinite(body.level) ? Math.max(0, Math.min(100, Math.trunc(body.level))) : 0,
    color: cleanString(body.color, { min: 0, max: 20 }) || null,
    permissions: typeof body.permissions === "object" && body.permissions ? body.permissions : {},
  };
  const { data, error } = await db().from("ranks").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(prof.actor, { module: "ranks", action: "create", targetType: "rank", targetId: data.id, summary: `Created rank ${name}`, after: data });
  return NextResponse.json(data);
}

// PATCH — update a rank (staff:edit)
export async function PATCH(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const patch: any = {};
  if (body.name !== undefined) { const n = cleanString(body.name, { min: 2, max: 60 }); if (!n) return NextResponse.json({ error: "Invalid name" }, { status: 400 }); patch.name = n; }
  if (body.level !== undefined) patch.level = Math.max(0, Math.min(100, Math.trunc(body.level)));
  if (body.color !== undefined) patch.color = body.color || null;
  if (body.permissions !== undefined && typeof body.permissions === "object") patch.permissions = body.permissions;

  const { data, error } = await db().from("ranks").update(patch).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(prof.actor, { module: "ranks", action: "edit", targetType: "rank", targetId: body.id, summary: `Edited rank ${data.name}`, after: data });
  return NextResponse.json(data);
}

// DELETE — remove a rank (staff:delete)
export async function DELETE(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "delete")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await db().from("ranks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "ranks", action: "delete", targetType: "rank", targetId: id, summary: "Deleted rank" });
  return NextResponse.json({ success: true });
}
