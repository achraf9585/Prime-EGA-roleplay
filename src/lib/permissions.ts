// Staff-Ops permission matrix. Each rank carries a `permissions` object of the
// shape { [module]: Action[] }. A wildcard "*" module or action grants all.
//
// This is SEPARATE from the legacy 4-role gating (admin/supervisor/member/
// app_reviewer) used by the existing whitelist/apps/codes routes — those are
// untouched. New Staff-Ops modules gate through can().

export const MODULES = [
  "staff",
  "duty",
  "performance",
  "complaints",
  "investigations",
  "discipline",
  "promotions",
  "attendance",
  "coverage",
  "leaderboards",
  "notifications",
  "audit",
] as const;

export const ACTIONS = ["view", "create", "edit", "delete", "approve", "export"] as const;

export type Module = (typeof MODULES)[number];
export type Action = (typeof ACTIONS)[number];
export type PermissionMatrix = Record<string, string[]>;

/** True if the matrix grants `action` on `module` (respects "*" wildcards). */
export function can(perms: PermissionMatrix | null | undefined, module: Module, action: Action): boolean {
  if (!perms) return false;
  const wildcard = perms["*"];
  if (wildcard && (wildcard.includes("*") || wildcard.includes(action))) return true;
  const mod = perms[module];
  if (!mod) return false;
  return mod.includes("*") || mod.includes(action);
}

/** Owner-level matrix — granted implicitly to super-admins as a safety net. */
export const OWNER_MATRIX: PermissionMatrix = { "*": ["*"] };
