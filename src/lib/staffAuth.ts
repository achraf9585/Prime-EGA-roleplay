import { getAdminSession } from "@/lib/adminAuth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createAdminClient } from "@/lib/server";
import { can as canDo, OWNER_MATRIX, type Module, type Action, type PermissionMatrix } from "@/lib/permissions";

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
  email?: string | null;
}

// Staff Operations is restricted to these email accounts only.
export const STAFF_OPS_EMAILS = ["achraf9585@gmail.com"];

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
      email: adminSession.email,
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

  return { type: "staff", name: `${data.discord_username} (${data.role})`, role: data.role as StaffRole, discordId, email: null };
}

/** True if the actor's role is one of the allowed roles. Admin always allowed unless excluded. */
export function actorHasRole(actor: Actor | null, allowed: StaffRole[]): boolean {
  return !!actor && allowed.includes(actor.role);
}

export interface StaffProfile {
  actor: Actor;
  staff: any | null;              // row from `staff` (with joined rank/department) or null
  permissions: PermissionMatrix;  // effective matrix (owner wildcard for super-admins)
  isOwner: boolean;
  can: (module: Module, action: Action) => boolean;
}

/**
 * Resolve the current actor's Staff-Ops profile + effective permission matrix.
 * Super-admins (legacy role "admin") always get the owner wildcard so they can
 * never be locked out of the new modules. Returns null if unauthenticated.
 */
export async function getStaffProfile(req: Request): Promise<StaffProfile | null> {
  const actor = await resolveActor(req);
  if (!actor) return null;

  // Staff Operations is restricted to a specific email allowlist.
  if (!actor.email || !STAFF_OPS_EMAILS.includes(actor.email.toLowerCase())) return null;

  const supabase = createAdminClient();

  // Match a staff row by discord_id first, then by email (admin actors carry
  // their email in `name`).
  let staff: any = null;
  if (actor.discordId) {
    const { data } = await supabase
      .from("staff")
      .select("*, rank:ranks(*), department:departments(*)")
      .eq("discord_id", actor.discordId)
      .maybeSingle();
    staff = data ?? null;
  }
  if (!staff && actor.type === "admin") {
    const { data } = await supabase
      .from("staff")
      .select("*, rank:ranks(*), department:departments(*)")
      .eq("email", actor.name)
      .maybeSingle();
    staff = data ?? null;
  }

  const isOwner = actor.role === "admin";
  const permissions: PermissionMatrix = isOwner
    ? OWNER_MATRIX
    : (staff?.rank?.permissions as PermissionMatrix) ?? {};

  return {
    actor,
    staff,
    permissions,
    isOwner,
    can: (module: Module, action: Action) => canDo(permissions, module, action),
  };
}
