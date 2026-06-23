import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { resolveActor } from "@/lib/staffAuth";

// Lazy — module-scope construction breaks the Vercel build (env unavailable at collect-page-data).
const db = () => createAdminClient();

// Roles allowed to VIEW the whitelist queue
const WL_VIEW_ROLES = ["admin", "supervisor", "member"];
// Roles allowed to issue a verdict (approve/reject) — members are review-only
const WL_VERDICT_ROLES = ["admin", "supervisor"];

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

  const enriched = await Promise.all((apps || []).map(async (app) => {
    const answers: Record<string, string> = app.quiz_answers || {};
    const ids = Object.keys(answers);
    if (ids.length === 0) return { ...app, quiz_details: [] };

    const { data: questions } = await supabase
      .from("whitelist_questions")
      .select("id, question_text, options, correct_answer, category_name")
      .in("id", ids);

    const quiz_details = (questions || []).map(q => ({
      id: q.id,
      question_text: q.question_text,
      category_name: q.category_name,
      options: q.options,
      correct_answer: q.correct_answer,
      given_answer: answers[q.id],
      is_correct: answers[q.id] === q.correct_answer,
    }));

    return { ...app, quiz_details };
  }));

  return NextResponse.json(enriched);
}

// PATCH — update application status (approve / reject)
export async function PATCH(req: NextRequest) {
  const actor = await resolveActor(req);
  if (!actor || !WL_VIEW_ROLES.includes(actor.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Members are review-only — they cannot issue verdicts
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

  // On approval, automatically grant the "Pass Granted" Discord role
  let roleAssigned = false;
  if (status === "approved" && updated?.discord_id) {
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
  }

  // Record an audit log entry
  await supabase.from("whitelist_logs").insert({
    application_id: id,
    candidate_name: updated?.character_name || null,
    candidate_discord: updated?.discord_username || null,
    action: status,
    actor_type: actor.type,
    actor_name: actor.name,
    notes: admin_notes || null,
  });

  return NextResponse.json({ success: true, roleAssigned });
}
