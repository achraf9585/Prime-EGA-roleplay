import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();
const TYPES = ["leave", "vacation", "absent"];

export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("attendance", "view")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const staffId = new URL(req.url).searchParams.get("staff_id");
  if (!staffId) return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });
  const { data, error } = await db().from("staff_leave").select("*").eq("staff_id", staffId).order("start_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("attendance", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.staff_id || !TYPES.includes(body.type) || !body.start_date) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }
  const row = {
    staff_id: body.staff_id,
    type: body.type,
    start_date: body.start_date,
    end_date: body.end_date || null,
    reason: cleanString(body.reason, { min: 0, max: 1000 }) || null,
    created_by: prof.actor.name,
  };
  const { data, error } = await db().from("staff_leave").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "attendance", action: "create", targetType: "staff", targetId: body.staff_id, summary: `Logged ${body.type}` });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("attendance", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await db().from("staff_leave").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "attendance", action: "delete", targetType: "leave", targetId: id, summary: "Removed leave record" });
  return NextResponse.json({ success: true });
}
