import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { resolveActor } from "@/lib/staffAuth";
import { removeDiscordRole } from "@/lib/discord";

// Lazy — module-scope construction breaks the Vercel build (env unavailable at collect-page-data).
const db = () => createAdminClient();

// Roles allowed to VIEW the whitelist queue
const WL_VIEW_ROLES = ["admin", "supervisor", "member"];
// Roles allowed to issue a verdict (approve/reject)
const WL_VERDICT_ROLES = ["admin", "supervisor", "member"];

// GET — list all whitelist applications (with question details)
export async function GET(req: NextRequest) {
  const actor = await resolveActor(req);
  if (!actor || !WL_VIEW_ROLES.includes(actor.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = db();
  const { data: apps, error } = await supabase
    .from("whitelist_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Batch question fetch: gather every question id referenced across all
  // applications, load them in ONE query, then attach details per-application.
  const allIds = new Set<string>();
  for (const app of apps || []) {
    for (const qid of Object.keys(app.quiz_answers || {})) allIds.add(qid);
  }

  const questionMap = new Map<string, any>();
  if (allIds.size > 0) {
    const { data: questions } = await supabase
      .from("whitelist_questions")
      .select("id, question_text, options, correct_answer, category_name")
      .in("id", Array.from(allIds));
    for (const q of questions || []) questionMap.set(q.id, q);
  }

  const enriched = (apps || []).map((app) => {
    const answers: Record<string, string> = app.quiz_answers || {};
    const ids = Object.keys(answers);
    const quiz_details = ids
      .map((qid) => questionMap.get(qid))
      .filter(Boolean)
      .map((q) => ({
        id: q.id,
        question_text: q.question_text,
        category_name: q.category_name,
        options: q.options,
        correct_answer: q.correct_answer,
        given_answer: answers[q.id],
        is_correct: answers[q.id] === q.correct_answer,
      }));
    return { ...app, quiz_details };
  });

  return NextResponse.json(enriched);
}

// PATCH — update application status (approve / reject)
export async function PATCH(req: NextRequest) {
  const actor = await resolveActor(req);
  if (!actor || !WL_VIEW_ROLES.includes(actor.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // All whitelist staff (admin / supervisor / member) may issue verdicts.
  if (!WL_VERDICT_ROLES.includes(actor.role)) {
    return NextResponse.json({ error: "Your role cannot issue verdicts." }, { status: 403 });
  }

  const supabase = db();

  const { id, status, admin_notes } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const update: any = { status, admin_notes, updated_at: new Date().toISOString() };
  if (status === "rejected") update.rejected_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("whitelist_applications")
    .update(update)
    .eq("id", id)
    .select("character_name, discord_username, discord_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Discord role side-effects (best-effort):
  //  - approved: grant the Pass-Granted role
  //  - rejected: revoke both Accepted and Pass-Granted (in case they were previously granted)
  let roleAssigned = false;
  let roleRevoked = false;
  if (updated?.discord_id) {
    if (status === "approved") {
      try {
        const guildId = process.env.DISCORD_GUILD_ID;
        const botToken = process.env.DISCORD_BOT_TOKEN;
        const roleId = process.env.DISCORD_ROLE_PASS_GRANTED;
        if (guildId && botToken && roleId) {
          const res = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${updated.discord_id}/roles/${roleId}`,
            { method: "PUT", headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" } }
          );
          if (res.ok) roleAssigned = true;
          else console.error("Failed to assign whitelist role:", res.status, await res.text());
        } else {
          console.log("Skipping whitelist role assignment — missing DISCORD_ROLE_PASS_GRANTED / guild / bot token");
        }
      } catch (err) {
        console.error("Error assigning whitelist role:", err);
      }
    } else if (status === "rejected") {
      const revokedAccepted = await removeDiscordRole(updated.discord_id, process.env.DISCORD_ROLE_ACCEPTED);
      const revokedPass = await removeDiscordRole(updated.discord_id, process.env.DISCORD_ROLE_PASS_GRANTED);
      roleRevoked = revokedAccepted || revokedPass;
    }
  }

  // Record an audit log entry
  await supabase.from("whitelist_logs").insert({
    application_id: id,
    candidate_name: updated?.character_name || null,
    candidate_discord: updated?.discord_username || null,
    action: status,
    actor_type: actor.type,
    actor_name: actor.name,
    actor_discord_id: actor.discordId || null,
    notes: admin_notes || null,
  });

  return NextResponse.json({ success: true, roleAssigned, roleRevoked });
}
