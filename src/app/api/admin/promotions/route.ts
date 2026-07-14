import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";
import { cleanString } from "@/lib/validation";

const db = () => createAdminClient();
const SELECT =
  "*, from_rank:ranks!from_rank_id(name,color,level), to_rank:ranks!to_rank_id(name,color,level), staff:staff(display_name)";

// GET ?staff_id= → that staff's promotion history. No param → all pending.
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("promotions", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const staffId = new URL(req.url).searchParams.get("staff_id");
  let q = db().from("promotions").select(SELECT).order("created_at", { ascending: false });
  q = staffId ? q.eq("staff_id", staffId) : q.eq("status", "pending");
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — propose a promotion (promotions:create)
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("promotions", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.staff_id || !body.to_rank_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: staff } = await db().from("staff").select("rank_id").eq("id", body.staff_id).single();

  const row = {
    staff_id: body.staff_id,
    from_rank_id: staff?.rank_id || null,
    to_rank_id: body.to_rank_id,
    reason: cleanString(body.reason, { min: 0, max: 3000 }) || null,
    requested_by: prof.actor.name,
    requested_by_discord_id: prof.actor.discordId || null,
  };
  const { data, error } = await db().from("promotions").insert(row).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await writeAudit(prof.actor, { module: "promotions", action: "create", targetType: "staff", targetId: body.staff_id, summary: "Proposed a promotion", after: data });
  return NextResponse.json(data);
}

// PATCH { id, action:"approve"|"reject" } — decide (promotions:approve)
export async function PATCH(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("promotions", "approve")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.id || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { data: promo } = await db().from("promotions").select("*").eq("id", body.id).single();
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (promo.status !== "pending") return NextResponse.json({ error: "Already decided" }, { status: 400 });

  const status = body.action === "approve" ? "approved" : "rejected";
  const { data, error } = await db()
    .from("promotions")
    .update({ status, decided_by: prof.actor.name, decided_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("status", "pending") // guard against double-decide race
    .select(SELECT)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Already decided" }, { status: 400 });

  // On approval, actually move the staff member to the new rank
  if (status === "approved" && promo.to_rank_id) {
    await db().from("staff").update({ rank_id: promo.to_rank_id, updated_at: new Date().toISOString() }).eq("id", promo.staff_id);
  }

  await writeAudit(prof.actor, { module: "promotions", action: "approve", targetType: "staff", targetId: promo.staff_id, summary: `Promotion ${status}` });
  return NextResponse.json(data);
}
