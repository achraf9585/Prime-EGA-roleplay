import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();
const TYPES = ["verbal_warning", "written_warning", "final_warning", "probation", "suspension", "demotion", "termination"];

// Effective status: an active record past its expiry reads as "expired".
function effectiveStatus(r: any): string {
  if (r.status === "revoked") return "revoked";
  if (r.expires_at && new Date(r.expires_at).getTime() < Date.now()) return "expired";
  return "active";
}

// GET ?staff_id= — discipline records for a staff member
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("discipline", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const staffId = new URL(req.url).searchParams.get("staff_id");
  if (!staffId) return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });

  const { data, error } = await db()
    .from("discipline_records")
    .select("*")
    .eq("staff_id", staffId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data || []).map((r) => ({ ...r, effective_status: effectiveStatus(r) })));
}

// POST — issue a disciplinary record
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("discipline", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.staff_id) return NextResponse.json({ error: "Missing staff_id" }, { status: 400 });
  if (!TYPES.includes(body.type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  const reason = cleanString(body.reason, { min: 2, max: 3000 });
  if (!reason) return NextResponse.json({ error: "Reason is required" }, { status: 400 });

  const row = {
    staff_id: body.staff_id,
    type: body.type,
    reason,
    evidence: cleanString(body.evidence, { min: 0, max: 2000 }) || null,
    expires_at: body.expires_at || null,
    issued_by: prof.actor.name,
    issued_by_discord_id: prof.actor.discordId || null,
  };
  const { data, error } = await db().from("discipline_records").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(prof.actor, { module: "discipline", action: "create", targetType: "staff", targetId: body.staff_id, summary: `Issued ${body.type} — ${reason.slice(0, 80)}`, after: data });
  return NextResponse.json({ ...data, effective_status: effectiveStatus(data) });
}

// PATCH { id, action:"revoke" } — revoke a record
export async function PATCH(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("discipline", "edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.id || body.action !== "revoke") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { data, error } = await db()
    .from("discipline_records")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_by: prof.actor.name })
    .eq("id", body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(prof.actor, { module: "discipline", action: "edit", targetType: "discipline", targetId: body.id, summary: "Revoked disciplinary record" });
  return NextResponse.json({ ...data, effective_status: effectiveStatus(data) });
}
