import { NextRequest, NextResponse } from "next/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { syncDuty } from "@/lib/duty";

// POST — pull new duty messages from Discord and record sessions.
// Allowed for: staff with duty:view, OR a Vercel cron carrying the CRON_SECRET.
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const prof = await getStaffProfile(req);
    if (!prof || !prof.can("duty", "view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await syncDuty();
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
  }
}

// GET — allow Vercel cron (which sends GET) to trigger the same sync.
export async function GET(req: NextRequest) {
  return POST(req);
}
