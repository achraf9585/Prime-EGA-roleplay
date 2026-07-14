import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";

const db = () => createAdminClient();
const SELECT = "*, staff:staff(id,display_name,avatar_url,discord_id)";
const VALID_SLOTS = [20, 21, 22, 23, 0, 1];

// Monday 00:00 of the current week (local server time)
function weekStart(): Date {
  const d = new Date();
  const dow = (d.getDay() + 6) % 7; // 0=Mon
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Actual datetime of a slot in the current week. Early-morning hours (0,1)
// belong to the calendar day AFTER the night's starting weekday.
function slotDateTime(dayOfWeek: number, slotHour: number): Date {
  const ws = weekStart();
  const offset = dayOfWeek + (slotHour < 12 ? 1 : 0);
  ws.setDate(ws.getDate() + offset);
  ws.setHours(slotHour, 0, 0, 0);
  return ws;
}

// GET — all assignments, each annotated with this-week compliance vs actual duty
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("duty", "view")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: assignments, error } = await db().from("schedule_assignments").select(SELECT);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pull this week's duty sessions to check compliance
  const ws = weekStart();
  const { data: sessions } = await db()
    .from("duty_sessions")
    .select("discord_id, started_at, ended_at")
    .gte("started_at", new Date(ws.getTime() - 2 * 3600_000).toISOString())
    .limit(3000);
  const now = Date.now();

  // Grace on each side of the slot so being a bit early/late still counts as covered.
  const GRACE_MS = 30 * 60 * 1000; // 30 minutes

  const annotated = (assignments || []).map((a: any) => {
    const dt = slotDateTime(a.day_of_week, a.slot_hour);
    const slotStart = dt.getTime();
    const slotEnd = slotStart + 3600_000;
    let compliance: "covered" | "missed" | "upcoming" = "upcoming";
    if (slotEnd <= now) {
      const discord = a.staff?.discord_id;
      const covered = discord && (sessions || []).some((s: any) => {
        if (s.discord_id !== discord) return false;
        const st = new Date(s.started_at).getTime();
        const en = s.ended_at ? new Date(s.ended_at).getTime() : now;
        return st < slotEnd + GRACE_MS && en > slotStart - GRACE_MS; // overlap with grace
      });
      compliance = covered ? "covered" : "missed";
    }
    return { ...a, compliance };
  });

  return NextResponse.json(annotated);
}

// POST — assign a staff member to a day+slot
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("duty", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const day = Number(body.day_of_week), slot = Number(body.slot_hour);
  if (!body.staff_id || day < 0 || day > 6 || !VALID_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Invalid assignment" }, { status: 400 });
  }
  const { data, error } = await db()
    .from("schedule_assignments")
    .upsert({ staff_id: body.staff_id, day_of_week: day, slot_hour: slot, created_by: prof.actor.name }, { onConflict: "staff_id,day_of_week,slot_hour", ignoreDuplicates: true })
    .select(SELECT);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "duty", action: "create", targetType: "schedule", summary: `Scheduled staff day ${day} slot ${slot}` });
  return NextResponse.json(data?.[0] || null);
}

// DELETE ?id= — remove an assignment
export async function DELETE(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("duty", "edit")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await db().from("schedule_assignments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "duty", action: "delete", targetType: "schedule", targetId: id, summary: "Removed schedule assignment" });
  return NextResponse.json({ success: true });
}
