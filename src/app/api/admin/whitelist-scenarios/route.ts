import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { resolveActor } from "@/lib/staffAuth";

// Roles allowed to view whitelist review material
const WL_VIEW_ROLES = ["admin", "supervisor", "member"];

// Map the candidate's faction choice to the scenario track in the DB.
const FACTION_TO_TRACK: Record<string, string> = {
  law_enforcement: "c",
  medical_services: "b",
  corporate: "a",
  criminal: "a",
  civilian: "a",
};

// GET — fetch scenarios matching a candidate's faction track
export async function GET(req: NextRequest) {
  const actor = await resolveActor(req);
  if (!actor || !WL_VIEW_ROLES.includes(actor.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const faction = searchParams.get("faction") || "";
  const track = FACTION_TO_TRACK[faction] || "a";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whitelist_scenarios")
    .select("*")
    .eq("track", track);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}
