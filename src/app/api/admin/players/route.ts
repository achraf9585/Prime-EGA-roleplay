import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

// In-memory cache (persists across requests in the same server process)
let cache: { data: any[]; at: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// GET — list Discord guild members who have the Pass Granted role
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const roleId = process.env.DISCORD_ROLE_PASS_GRANTED;

  if (!guildId || !botToken || !roleId) {
    return NextResponse.json(
      { error: "Missing Discord configuration (guild / bot token / role id)" },
      { status: 500 }
    );
  }

  // Serve from cache unless a refresh is forced
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "1";
  if (!forceRefresh && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({ players: cache.data, cached: true, fetchedAt: cache.at });
  }

  try {
    // Page through guild members (Discord caps each page at 1000)
    const members: any[] = [];
    let after = "0";
    for (let i = 0; i < 20; i++) {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${after}`,
        { headers: { Authorization: `Bot ${botToken}` } }
      );
      if (!res.ok) {
        const text = await res.text();
        // 403 with code 50001 usually means the Server Members Intent is disabled
        return NextResponse.json(
          { error: `Discord API error (${res.status}): ${text}` },
          { status: 502 }
        );
      }
      const page = await res.json();
      if (!Array.isArray(page) || page.length === 0) break;
      members.push(...page);
      after = page[page.length - 1].user.id;
      if (page.length < 1000) break;
    }

    // Keep only members holding the Pass Granted role
    const players = members
      .filter((m) => Array.isArray(m.roles) && m.roles.includes(roleId))
      .map((m) => ({
        id: m.user.id,
        username: m.user.username,
        global_name: m.user.global_name || null,
        nickname: m.nick || null,
        avatar: m.user.avatar
          ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
          : null,
        joined_at: m.joined_at,
      }));

    cache = { data: players, at: Date.now() };
    return NextResponse.json({ players, cached: false, fetchedAt: cache.at });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch members" }, { status: 500 });
  }
}
