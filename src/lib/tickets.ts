import { createAdminClient } from "@/lib/server";

// Ticket Tool creates one channel per ticket named `ticket-<number>` and
// DELETES it on close. We snapshot each open ticket to Supabase on every poll;
// when a previously-seen ticket channel disappears we mark it closed. That gives
// per-staff response metrics + resolution times without a transcript/log channel.

const TICKET_NAME_RE = /^ticket-(\d+)$/i;
const DISCORD_EPOCH = 1420070400000;

interface DiscordChannel { id: string; name: string; type: number; }
interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  author: { id: string; username: string; global_name?: string | null; bot?: boolean };
  mentions?: { id: string }[];
}

// Snowflake → creation time (ms). Used for a ticket's open time — no history read needed.
function snowflakeMs(id: string): number {
  return Number(BigInt(id) >> BigInt(22)) + DISCORD_EPOCH;
}

class DiscordError extends Error {
  status: number;
  constructor(status: number, msg: string) { super(msg); this.status = status; }
}

async function discord(path: string, token: string): Promise<any> {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) throw new DiscordError(res.status, `Discord API ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

interface TicketAgg {
  opener_discord_id: string | null;
  opener_username: string | null;
  first_response_at: string | null;
  first_responder_discord_id: string | null;
  handlers: Set<string>;
  staff_msg_count: number;
  cursor: string | null;
}

// Scan a ticket channel's messages after `cursor`, folding results into `agg`.
async function scanChannel(
  channelId: string,
  agg: TicketAgg,
  staffIds: Set<string>,
  token: string,
): Promise<number> {
  let cursor = agg.cursor || channelId; // channel id is a floor below the first message
  let scanned = 0;
  for (let page = 0; page < 8; page++) {
    const batch: DiscordMessage[] = await discord(
      `/channels/${channelId}/messages?limit=100&after=${cursor}`,
      token,
    );
    if (!batch.length) break;
    const asc = [...batch].sort((a, b) => a.id.localeCompare(b.id));
    for (const m of asc) {
      scanned++;
      if (m.author.bot) {
        // Ticket Tool's welcome message ("Hello @user") identifies the opener.
        if (!agg.opener_discord_id && m.mentions && m.mentions.length) {
          agg.opener_discord_id = m.mentions[0].id;
        }
        continue;
      }
      // First human seen becomes the opener if the bot mention was missed.
      if (!agg.opener_discord_id) {
        agg.opener_discord_id = m.author.id;
        agg.opener_username = m.author.global_name || m.author.username;
        continue;
      }
      if (m.author.id === agg.opener_discord_id) continue; // opener's own replies
      if (!staffIds.has(m.author.id)) continue;            // only tracked staff count
      if (!agg.first_response_at) {
        agg.first_response_at = m.timestamp;
        agg.first_responder_discord_id = m.author.id;
      }
      agg.handlers.add(m.author.id);
      agg.staff_msg_count++;
    }
    cursor = asc[asc.length - 1].id;
    agg.cursor = cursor;
    if (batch.length < 100) break;
  }
  return scanned;
}

/**
 * Poll live Ticket Tool channels, snapshot open tickets, and close any tracked
 * ticket whose channel has disappeared. Best-effort; throws only on config/API errors.
 */
export async function syncTickets(): Promise<{ live: number; opened: number; closed: number; scanned: number; skipped: number }> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!token || !guildId) throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID");

  const supabase = createAdminClient();

  // 1. Which channels are live ticket channels right now?
  const channels: DiscordChannel[] = await discord(`/guilds/${guildId}/channels`, token);
  const liveTickets = channels.filter((c) => c.type === 0 && TICKET_NAME_RE.test(c.name));
  const liveIds = new Set(liveTickets.map((c) => c.id));

  // 2. Known staff for attribution
  const { data: staffRows } = await supabase.from("staff").select("id, discord_id");
  const staffByDiscord = new Map((staffRows || []).map((s: any) => [s.discord_id, s.id]));
  const staffIds = new Set((staffRows || []).map((s: any) => s.discord_id).filter(Boolean));

  let opened = 0, scanned = 0, skipped = 0;

  for (const ch of liveTickets) {
    const num = Number(ch.name.match(TICKET_NAME_RE)![1]);

    const { data: existing } = await supabase.from("tickets").select("*").eq("channel_id", ch.id).maybeSingle();

    const agg: TicketAgg = {
      opener_discord_id: existing?.opener_discord_id ?? null,
      opener_username: existing?.opener_username ?? null,
      first_response_at: existing?.first_response_at ?? null,
      first_responder_discord_id: existing?.first_responder_discord_id ?? null,
      handlers: new Set<string>(existing?.handler_ids || []),
      staff_msg_count: existing?.staff_msg_count ?? 0,
      cursor: existing?.last_scanned_message_id ?? null,
    };

    try {
      scanned += await scanChannel(ch.id, agg, staffIds, token);
    } catch (e) {
      // Bot lacks access to this private ticket channel — skip it, don't abort the run.
      if (e instanceof DiscordError && (e.status === 403 || e.status === 404)) { skipped++; continue; }
      throw e;
    }

    const row = {
      channel_id: ch.id,
      ticket_number: Number.isFinite(num) ? num : null,
      channel_name: ch.name,
      opener_discord_id: agg.opener_discord_id,
      opener_username: agg.opener_username,
      opened_at: existing?.opened_at ?? new Date(snowflakeMs(ch.id)).toISOString(),
      first_response_at: agg.first_response_at,
      first_responder_discord_id: agg.first_responder_discord_id,
      first_responder_staff_id: agg.first_responder_discord_id ? staffByDiscord.get(agg.first_responder_discord_id) || null : null,
      handler_ids: Array.from(agg.handlers),
      staff_msg_count: agg.staff_msg_count,
      last_scanned_message_id: agg.cursor,
      status: "open",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("tickets").upsert(row, { onConflict: "channel_id" });
    if (error) throw new Error(`Ticket upsert failed: ${error.message}`);
    if (!existing) opened++;
  }

  // 3. Close tickets whose channel has vanished (Ticket Tool deleted it on close).
  const { data: openRows } = await supabase.from("tickets").select("id, channel_id, opened_at").eq("status", "open");
  let closed = 0;
  const now = Date.now();
  for (const t of openRows || []) {
    if (liveIds.has(t.channel_id)) continue;
    const resolution = Math.max(0, Math.round((now - new Date(t.opened_at).getTime()) / 1000));
    await supabase
      .from("tickets")
      .update({ status: "closed", closed_at: new Date().toISOString(), resolution_seconds: resolution, updated_at: new Date().toISOString() })
      .eq("id", t.id);
    closed++;
  }

  return { live: liveTickets.length, opened, closed, scanned, skipped };
}
