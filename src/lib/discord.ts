// Assign a Discord role to a guild member via the bot (REST API — no gateway needed).
// Best-effort: returns false if config is missing or the API call fails
// (e.g. bot lacks Manage Roles, role is above the bot's top role, or the user left).
export async function assignDiscordRole(userId: string, roleId: string | undefined): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!botToken || !guildId || !roleId || !userId) return false;
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      { method: "PUT", headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" } }
    );
    if (!res.ok) {
      console.error("[discord] assign role failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[discord] assign role error:", e);
    return false;
  }
}

// Send a direct message to a Discord user via the bot (REST API — no gateway needed).
// Best-effort: returns false on failure (e.g. user has DMs closed or doesn't share the guild).

export async function sendDiscordDM(
  userId: string,
  payload: { content?: string; embeds?: any[] }
): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !userId) return false;

  try {
    // 1. Open (or fetch) a DM channel with the user
    const chRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: userId }),
    });
    if (!chRes.ok) {
      console.error("[discord] open DM failed:", chRes.status, await chRes.text());
      return false;
    }
    const channel = await chRes.json();

    // 2. Send the message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!msgRes.ok) {
      console.error("[discord] send DM failed:", msgRes.status, await msgRes.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[discord] DM error:", e);
    return false;
  }
}
