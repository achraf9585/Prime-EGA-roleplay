import { getAdminSession } from "@/lib/adminAuth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createAdminClient } from "@/lib/server";

/**
 * Unified authorization for the dashboard.
 *
 * Identities:
 *  - Super Admin     → role "admin"  (via signed admin session cookie)
 *  - Whitelist staff → role "supervisor" | "member" (via Discord session + whitelist_staff)
 *  - App Reviewer    → role "app_reviewer" (via Discord session + whitelist_staff)
 */
export type StaffRole = "admin" | "supervisor" | "member" | "app_reviewer";

export interface Actor {
  type: "admin" | "staff";
  name: string;
  role: StaffRole;
  discordId?: string | null;
}

/** Resolve who is making the request, or null if unauthenticated/unauthorized. */
export async function resolveActor(req: Request): Promise<Actor | null> {
  // 1. Email/password session cookie (carries a role: admin | supervisor | member | app_reviewer)
  const adminSession = getAdminSession(req);
  if (adminSession) {
    // Look up the operator's linked Discord ID (for audit logs / display)
    let discordId: string | null = null;
    const supabase = createAdminClient();
    const { data: op } = await supabase
      .from("AdminUsers")
      .select("discord_id")
      .eq("email", adminSession.email)
      .single();
    discordId = op?.discord_id ?? null;

    return {
      type: adminSession.role === "admin" ? "admin" : "staff",
      name: adminSession.email,
      role: adminSession.role as StaffRole,
      discordId,
    };
  }

  // 2. Discord-authenticated staff
  const session = await getServerSession(authOptions);
  const discordId = (session?.user as any)?.id;
  if (!discordId) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("whitelist_staff")
    .select("role, discord_username")
    .eq("discord_id", discordId)
    .single();
  if (!data?.role) return null;

  return { type: "staff", name: `${data.discord_username} (${data.role})`, role: data.role as StaffRole, discordId };
}

/** True if the actor's role is one of the allowed roles. Admin always allowed unless excluded. */
export function actorHasRole(actor: Actor | null, allowed: StaffRole[]): boolean {
  return !!actor && allowed.includes(actor.role);
}
