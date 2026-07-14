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

// Fetch a Discord user's avatar URL via the bot. Falls back to the default
// embed avatar. Returns null if the user can't be fetched.
export async function fetchDiscordAvatar(userId: string): Promise<string | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !userId) return null;
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: { Authorization: `Bot ${botToken}` },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d.avatar
      ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(d.id) >> BigInt(22)) % 6}.png`;
  } catch {
    return null;
  }
}

// Remove a Discord role from a guild member via the bot.
// Best-effort: returns false if config is missing, the user has left, or the role
// was above the bot's top role. Safe to call even if the user doesn't have the role.
export async function removeDiscordRole(userId: string, roleId: string | undefined): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!botToken || !guildId || !roleId || !userId) return false;
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      { method: "DELETE", headers: { Authorization: `Bot ${botToken}` } }
    );
    if (!res.ok) {
      console.error("[discord] remove role failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[discord] remove role error:", e);
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
