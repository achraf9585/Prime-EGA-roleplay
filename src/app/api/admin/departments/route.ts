import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();

export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await db().from("departments").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

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
    description: cleanString(body.description, { min: 0, max: 500 }) || null,
    color: body.color || null,
  };
  const { data, error } = await db().from("departments").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "departments", action: "create", targetType: "department", targetId: data.id, summary: `Created department ${name}`, after: data });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch: any = {};
  if (body.name !== undefined) { const n = cleanString(body.name, { min: 2, max: 60 }); if (!n) return NextResponse.json({ error: "Invalid name" }, { status: 400 }); patch.name = n; }
  if (body.description !== undefined) patch.description = body.description || null;
  if (body.color !== undefined) patch.color = body.color || null;
  const { data, error } = await db().from("departments").update(patch).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "departments", action: "edit", targetType: "department", targetId: body.id, summary: `Edited department ${data.name}`, after: data });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "delete")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await db().from("departments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "departments", action: "delete", targetType: "department", targetId: id, summary: "Deleted department" });
  return NextResponse.json({ success: true });
}
