import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";

// GET ?module=&limit= — recent audit-log entries (newest first)
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("audit", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");
  const limit = Math.min(500, Number(searchParams.get("limit")) || 200);

  let q = createAdminClient().from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (module && module !== "all") q = q.eq("module", module);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
