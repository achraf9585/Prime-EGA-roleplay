import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";

// Duty tracking launched on this date — mirrors TRACKING_START in the UI.
const TRACKING_START = new Date(2026, 6, 12, 0, 0, 0, 0).getTime();
const DAY_MS = 86_400_000;

type Severity = "high" | "medium" | "low";
interface Alert {
  id: string;
  severity: Severity;
  module: string;
  title: string;
  detail: string;
  count?: number;
  href?: string;
}

// GET — derive live operational alerts from existing data. Nothing is stored;
// alerts are recomputed each call so they always reflect current state.
export async function GET(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const now = Date.now();
  const alerts: Alert[] = [];

  // ── Pending promotions awaiting approval ──
  if (prof.can("promotions", "view")) {
    const { count } = await db.from("promotions").select("id", { count: "exact", head: true }).eq("status", "pending");
    if (count && count > 0) {
      alerts.push({
        id: "promotions-pending",
        severity: count >= 5 ? "high" : "medium",
        module: "promotions",
        title: "Promotions awaiting approval",
        detail: `${count} promotion request${count === 1 ? "" : "s"} pending review.`,
        count,
        href: "/admin/staff",
      });
    }
  }

  // ── Open complaints & stale investigations ──
  if (prof.can("complaints", "view")) {
    const { data: complaints } = await db.from("complaints").select("status, created_at, updated_at");
    const openStatuses = ["open", "investigating", "waiting_evidence", "interview"];
    const open = (complaints || []).filter((c) => openStatuses.includes(c.status));
    if (open.length > 0) {
      alerts.push({
        id: "complaints-open",
        severity: open.length >= 8 ? "high" : "medium",
        module: "complaints",
        title: "Open complaints",
        detail: `${open.length} complaint case${open.length === 1 ? "" : "s"} still open.`,
        count: open.length,
        href: "/admin/complaints",
      });
    }
    // Stale — open with no activity for 7+ days
    const stale = open.filter((c) => {
      const last = new Date(c.updated_at || c.created_at).getTime();
      return now - last > 7 * DAY_MS;
    });
    if (stale.length > 0) {
      alerts.push({
        id: "complaints-stale",
        severity: "high",
        module: "complaints",
        title: "Stale investigations",
        detail: `${stale.length} open complaint${stale.length === 1 ? "" : "s"} untouched for 7+ days.`,
        count: stale.length,
        href: "/admin/complaints",
      });
    }
  }

  // ── Active discipline records ──
  if (prof.can("discipline", "view")) {
    const { data: disc } = await db.from("discipline_records").select("status, expires_at").eq("status", "active");
    const active = (disc || []).filter((d) => !d.expires_at || new Date(d.expires_at).getTime() > now).length;
    if (active > 0) {
      alerts.push({
        id: "discipline-active",
        severity: active >= 5 ? "high" : "low",
        module: "discipline",
        title: "Active disciplinary actions",
        detail: `${active} staff currently under active discipline.`,
        count: active,
      });
    }
  }

  // ── Duty sessions left open too long (likely forgot to go off duty) ──
  if (prof.can("duty", "view")) {
    const { data: openSessions } = await db
      .from("duty_sessions")
      .select("discord_id, discord_username, started_at, staff:staff(display_name)")
      .is("ended_at", null)
      .limit(200);
    const stuck = (openSessions || []).filter((s) => now - new Date(s.started_at).getTime() > 6 * 60 * 60 * 1000);
    if (stuck.length > 0) {
      const names = stuck.map((s) => (s.staff as any)?.display_name || s.discord_username || s.discord_id).slice(0, 3).join(", ");
      alerts.push({
        id: "duty-stuck",
        severity: "medium",
        module: "duty",
        title: "Long-running duty sessions",
        detail: `${stuck.length} session${stuck.length === 1 ? "" : "s"} open 6h+${names ? ` (${names}${stuck.length > 3 ? "…" : ""})` : ""} — someone may have forgotten to sign off.`,
        count: stuck.length,
        href: "/admin/staff",
      });
    }
  }

  // ── Inactive staff — active members with no duty in the last 7 days ──
  if (prof.can("staff", "view") && prof.can("duty", "view")) {
    const { data: staffRows } = await db.from("staff").select("display_name, discord_id, status").eq("status", "active");
    const activeStaff = (staffRows || []).filter((s) => s.discord_id);
    if (activeStaff.length > 0) {
      const since = new Date(Math.max(now - 7 * DAY_MS, TRACKING_START)).toISOString();
      const { data: recent } = await db
        .from("duty_sessions")
        .select("discord_id")
        .gte("started_at", since)
        .limit(5000);
      const activeIds = new Set((recent || []).map((r) => r.discord_id));
      // Only meaningful once tracking has been live for at least 7 days.
      if (now - TRACKING_START > 7 * DAY_MS) {
        const inactive = activeStaff.filter((s) => !activeIds.has(s.discord_id));
        if (inactive.length > 0) {
          const names = inactive.map((s) => s.display_name).slice(0, 3).join(", ");
          alerts.push({
            id: "staff-inactive",
            severity: inactive.length >= activeStaff.length / 2 ? "high" : "medium",
            module: "staff",
            title: "Inactive staff",
            detail: `${inactive.length} active staff logged no duty in the last 7 days${names ? ` (${names}${inactive.length > 3 ? "…" : ""})` : ""}.`,
            count: inactive.length,
            href: "/admin/staff",
          });
        }
      }
    }
  }

  // ── Uncovered schedule slots ──
  if (prof.can("coverage", "view") || prof.can("staff", "view")) {
    const { data: assignments, error } = await db.from("schedule_assignments").select("day_of_week, slot_hour");
    if (!error) {
      const covered = new Set((assignments || []).map((a) => `${a.day_of_week}-${a.slot_hour}`));
      const SLOTS = [20, 21, 22, 23, 0, 1];
      let gaps = 0;
      for (let day = 0; day < 7; day++) for (const h of SLOTS) if (!covered.has(`${day}-${h}`)) gaps++;
      if (gaps > 0) {
        alerts.push({
          id: "schedule-gaps",
          severity: gaps >= 21 ? "high" : gaps >= 7 ? "medium" : "low",
          module: "coverage",
          title: "Uncovered shift slots",
          detail: `${gaps} of ${7 * SLOTS.length} weekly slots have no admin assigned.`,
          count: gaps,
          href: "/admin/staff",
        });
      }
    }
  }

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return NextResponse.json({
    alerts,
    counts: {
      total: alerts.length,
      high: alerts.filter((a) => a.severity === "high").length,
      medium: alerts.filter((a) => a.severity === "medium").length,
      low: alerts.filter((a) => a.severity === "low").length,
    },
    generatedAt: new Date().toISOString(),
  });
}
