import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server";
import { getStaffProfile } from "@/lib/staffAuth";
import { writeAudit } from "@/lib/audit";

// POST — bulk-create staff from every Discord member holding a given role.
// Body: { role_id? } (defaults to DISCORD_STAFF_TEAM_ROLE_ID). Idempotent:
// existing staff (by discord_id) are skipped, not duplicated.
export async function POST(req: NextRequest) {
  const prof = await getStaffProfile(req);
  if (!prof || !prof.can("staff", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const body = await req.json().catch(() => ({}));
  const roleId = body.role_id || process.env.DISCORD_STAFF_TEAM_ROLE_ID;

  if (!botToken || !guildId || !roleId) {
    return NextResponse.json({ error: "Missing Discord config (bot token / guild / role id)" }, { status: 500 });
  }

  // Page through guild members (needs Server Members Intent)
  const members: any[] = [];
  let after = "0";
  try {
    for (let i = 0; i < 20; i++) {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${after}`,
        { headers: { Authorization: `Bot ${botToken}` } }
      );
      if (!res.ok) {
        return NextResponse.json({ error: `Discord API ${res.status}: ${await res.text()}` }, { status: 502 });
      }
      const page = await res.json();
      if (!Array.isArray(page) || page.length === 0) break;
      members.push(...page);
      after = page[page.length - 1].user.id;
      if (page.length < 1000) break;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch members" }, { status: 500 });
  }

  const withRole = members.filter((m) => Array.isArray(m.roles) && m.roles.includes(roleId));

  const supabase = createAdminClient();

  // Which of these already exist?
  const ids = withRole.map((m) => m.user.id);
  const { data: existing } = await supabase.from("staff").select("discord_id").in("discord_id", ids.length ? ids : ["_none_"]);
  const existingSet = new Set((existing || []).map((s: any) => s.discord_id));

  const toInsert = withRole
    .filter((m) => !existingSet.has(m.user.id))
    .map((m) => ({
      display_name: m.nick || m.user.global_name || m.user.username,
      discord_id: m.user.id,
      avatar_url: m.user.avatar
        ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(m.user.id) >> BigInt(22)) % 6}.png`,
      status: "active",
    }));

  let imported = 0;
  if (toInsert.length > 0) {
    const { data, error } = await supabase.from("staff").insert(toInsert).select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    imported = data?.length || 0;
  }

  await writeAudit(prof.actor, {
    module: "staff",
    action: "create",
    summary: `Bulk-imported ${imported} staff from Discord role`,
    after: { role_id: roleId, imported, skipped: withRole.length - imported, matched: withRole.length },
  });

  return NextResponse.json({ imported, skipped: withRole.length - imported, matched: withRole.length });
}
