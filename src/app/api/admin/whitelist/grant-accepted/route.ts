import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { resolveActor } from "@/lib/staffAuth";
import { assignDiscordRole, sendDiscordDM } from "@/lib/discord";

// Roles that may grant the Accepted role manually
const WL_VERDICT_ROLES = ["admin", "supervisor", "member"];

/**
 * POST /api/admin/whitelist/grant-accepted
 * Body: { id: string }  ← whitelist_applications.id
 *
 * Grants DISCORD_ROLE_ACCEPTED to the applicant on demand. Idempotent — Discord
 * returns 204 whether or not the user already had the role.
 */
export async function POST(req: NextRequest) {
  const actor = await resolveActor(req);
  if (!actor || !WL_VERDICT_ROLES.includes(actor.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing application id" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: app, error } = await supabase
    .from("whitelist_applications")
    .select("discord_id, discord_username, character_name, quiz_score, status")
    .eq("id", id)
    .single();

  if (error || !app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  // Only pass-quiz candidates should be receiving this role manually.
  if ((app.quiz_score ?? 0) < 15) {
    return NextResponse.json({ error: "Candidate did not pass the quiz." }, { status: 400 });
  }
  if (app.status === "rejected") {
    return NextResponse.json({ error: "Cannot grant the Accepted role to a rejected application." }, { status: 400 });
  }
  if (!app.discord_id) {
    return NextResponse.json({ error: "No Discord ID on record." }, { status: 400 });
  }

  const ok = await assignDiscordRole(app.discord_id, process.env.DISCORD_ROLE_ACCEPTED);

  // Mark the application approved so it no longer shows as "pending"
  if (ok) {
    await supabase
      .from("whitelist_applications")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  // Audit + DM the candidate
  await supabase.from("whitelist_logs").insert({
    application_id: id,
    candidate_name: app.character_name || null,
    candidate_discord: app.discord_username || null,
    action: "accepted_role_granted",
    actor_type: actor.type,
    actor_name: actor.name,
    actor_discord_id: actor.discordId || null,
    notes: ok ? null : "Discord API refused role assignment",
  });

  if (ok) {
    await sendDiscordDM(app.discord_id, {
      embeds: [{
        title: "🎉 Accepted Role Granted",
        description:
          "Your whitelist application has been reviewed and you've been granted the **Accepted** role on EGA Roleplay.\n\n" +
          "You now have server access. See you in the city!",
        color: 0x22c55e,
      }],
    });
  }

  return NextResponse.json({ ok, granted: ok });
}
