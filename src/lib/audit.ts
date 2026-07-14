import { createAdminClient } from "@/lib/server";
import type { Actor } from "@/lib/staffAuth";

export interface AuditEntry {
  module: string;
  action: string;
  targetType?: string;
  targetId?: string;
  summary?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ip?: string | null;
}

/**
 * Write a general-purpose audit log entry. Best-effort — never throws into the
 * caller (a failed audit write must not break the action it records).
 */
export async function writeAudit(actor: Actor | null, entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      actor_type: actor?.type ?? null,
      actor_name: actor?.name ?? null,
      actor_discord_id: actor?.discordId ?? null,
      module: entry.module,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      summary: entry.summary ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      reason: entry.reason ?? null,
      ip: entry.ip ?? null,
    });
  } catch (e) {
    console.error("[audit] write failed:", e);
  }
}
