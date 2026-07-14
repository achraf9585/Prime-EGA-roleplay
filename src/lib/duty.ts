import { createAdminClient } from "@/lib/server";
import { sendDiscordDM } from "@/lib/discord";

// Max session length before we assume the person forgot to type "off duty".
const MAX_SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours
// Remind a still-on-duty person after this long (once).
const REMIND_AFTER_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Classify a duty-channel message.
 * "off duty" is checked before "on duty" because it also contains "duty".
 */
export function parseDuty(content: string): "on" | "off" | null {
  const t = content.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return null;
  const hasDuty = t.includes("duty");
  const off = /\boff\b/.test(t);
  const on = /\bon\b/.test(t);
  if (hasDuty && off) return "off";
  if (hasDuty && on) return "on";
  if (t === "off") return "off";
  if (t === "on") return "on";
  return null;
}

interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  author: { id: string; username: string; global_name?: string | null };
}

/**
 * Poll the duty channel for new messages and turn on/off-duty lines into
 * duty_sessions. Incremental via duty_sync_state.last_message_id.
 * Returns a small summary. Best-effort — throws only on config errors.
 */
export async function syncDuty(): Promise<{ processed: number; opened: number; closed: number; autoClosed: number; reminded: number }> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_DUTY_CHANNEL_ID;
  if (!botToken || !channelId) {
    throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_DUTY_CHANNEL_ID");
  }

  const supabase = createAdminClient();

  // 1. Where did we leave off?
  const { data: state } = await supabase
    .from("duty_sync_state")
    .select("last_message_id")
    .eq("channel_id", channelId)
    .maybeSingle();
  const lastId = state?.last_message_id ?? null;

  // 2. Fetch new messages (newest-first from Discord)
  const url = new URL(`https://discord.com/api/v10/channels/${channelId}/messages`);
  url.searchParams.set("limit", "100");
  if (lastId) url.searchParams.set("after", lastId);
  const res = await fetch(url.toString(), { headers: { Authorization: `Bot ${botToken}` } });
  if (!res.ok) throw new Error(`Discord API ${res.status}: ${await res.text()}`);
  const messages: DiscordMessage[] = await res.json();

  // Process chronologically (oldest → newest)
  const ordered = [...messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Map known staff by discord_id for linking
  const { data: staffRows } = await supabase.from("staff").select("id, discord_id");
  const staffByDiscord = new Map((staffRows || []).map((s: any) => [s.discord_id, s.id]));

  let opened = 0, closed = 0;

  for (const msg of ordered) {
    const action = parseDuty(msg.content);
    if (!action) continue;
    const discordId = msg.author.id;
    const username = msg.author.global_name || msg.author.username;

    // current open session for this user
    const { data: open } = await supabase
      .from("duty_sessions")
      .select("id, started_at")
      .eq("discord_id", discordId)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (action === "on") {
      if (open) {
        // They forgot to sign off, then signed on again → close the stale session
        // at this new sign-on time (best estimate they were off before), then reopen.
        const dur = Math.max(0, Math.round((new Date(msg.timestamp).getTime() - new Date(open.started_at).getTime()) / 1000));
        await supabase.from("duty_sessions").update({ ended_at: msg.timestamp, duration_seconds: dur, auto_closed: true }).eq("id", open.id);
        closed++;
      }
      const { error } = await supabase.from("duty_sessions").insert({
        staff_id: staffByDiscord.get(discordId) || null,
        discord_id: discordId,
        discord_username: username,
        started_at: msg.timestamp,
        start_message_id: msg.id,
      });
      if (error) throw new Error(`Failed to open session: ${error.message}`);
      opened++;
    } else if (action === "off") {
      if (!open) continue; // no open session — ignore stray off
      const dur = Math.max(0, Math.round((new Date(msg.timestamp).getTime() - new Date(open.started_at).getTime()) / 1000));
      const { error } = await supabase
        .from("duty_sessions")
        .update({ ended_at: msg.timestamp, duration_seconds: dur, end_message_id: msg.id })
        .eq("id", open.id);
      if (error) throw new Error(`Failed to close session: ${error.message}`);
      closed++;
    }
  }

  // 3. Advance the cursor to the newest message id we saw
  if (ordered.length > 0) {
    const newest = ordered[ordered.length - 1].id;
    await supabase.from("duty_sync_state").upsert(
      { channel_id: channelId, last_message_id: newest, updated_at: new Date().toISOString() },
      { onConflict: "channel_id" }
    );
  }

  // 4. Remind people still on duty past the threshold (before the auto-close cap)
  const reminded = await remindStillOnDuty(supabase);

  // 5. Auto-close sessions left open past the cap
  const autoClosed = await autoCloseStale(supabase);

  return { processed: ordered.length, opened, closed, autoClosed, reminded };
}

// DM anyone on duty longer than REMIND_AFTER_MS who hasn't been reminded yet.
async function remindStillOnDuty(supabase: ReturnType<typeof createAdminClient>): Promise<number> {
  const cutoff = new Date(Date.now() - REMIND_AFTER_MS).toISOString();
  const { data } = await supabase
    .from("duty_sessions")
    .select("id, discord_id, started_at")
    .is("ended_at", null)
    .is("reminded_at", null)
    .lt("started_at", cutoff);
  if (!data || data.length === 0) return 0;
  for (const s of data) {
    await sendDiscordDM(s.discord_id, {
      embeds: [{
        title: "⏰ Still on duty?",
        description: "You've been marked **on duty** for over 4 hours. If you've finished your shift, please type **off duty** in the duty channel so your hours are recorded correctly.",
        color: 0xf59e0b,
      }],
    });
    await supabase.from("duty_sessions").update({ reminded_at: new Date().toISOString() }).eq("id", s.id);
  }
  return data.length;
}

async function autoCloseStale(supabase: ReturnType<typeof createAdminClient>): Promise<number> {
  const cutoffIso = new Date(Date.now() - MAX_SESSION_MS).toISOString();
  const { data: stale } = await supabase
    .from("duty_sessions")
    .select("id, started_at")
    .is("ended_at", null)
    .lt("started_at", cutoffIso);
  if (!stale || stale.length === 0) return 0;
  for (const s of stale) {
    const end = new Date(new Date(s.started_at).getTime() + MAX_SESSION_MS).toISOString();
    await supabase
      .from("duty_sessions")
      .update({ ended_at: end, duration_seconds: Math.round(MAX_SESSION_MS / 1000), auto_closed: true })
      .eq("id", s.id);
  }
  return stale.length;
}
