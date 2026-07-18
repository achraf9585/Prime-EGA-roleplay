import { NextRequest, NextResponse } from "next/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { syncTickets } from "@/lib/tickets";

// POST — snapshot live Ticket Tool channels and close vanished ones.
// Allowed for: staff with tickets:view, OR a Vercel cron carrying CRON_SECRET.
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const prof = await getStaffProfile(req);
    if (!prof || !prof.can("tickets", "view")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await syncTickets();
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
  }
}

// GET — allow Vercel cron (which sends GET) to trigger the same sync.
export async function GET(req: NextRequest) {
  return POST(req);
}
