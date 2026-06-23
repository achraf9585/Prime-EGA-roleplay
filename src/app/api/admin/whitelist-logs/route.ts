import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { resolveActor } from "@/lib/staffAuth";

const WL_VIEW_ROLES = ["admin", "supervisor", "member"];

// GET — list whitelist audit logs (optionally filter by application_id)
export async function GET(req: NextRequest) {
  const actor = await resolveActor(req);
  if (!actor || !WL_VIEW_ROLES.includes(actor.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("application_id");

  let query = supabase
    .from("whitelist_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (applicationId) query = query.eq("application_id", applicationId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
