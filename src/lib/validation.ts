// Server-side input validation helpers. The frontend already validates, but the
// server must never trust the client — these guard against oversized payloads,
// empty/garbage values, and unsafe URLs that get rendered later (stored XSS / SSRF).

/** Trim and enforce a non-empty string within [min, max] length. Returns null if invalid. */
export function cleanString(
  value: unknown,
  { min = 1, max = 5000 }: { min?: number; max?: number } = {}
): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (v.length < min || v.length > max) return null;
  return v;
}

/** Optional string: undefined/null/"" allowed; if present, capped at max. */
export function cleanOptionalString(value: unknown, max = 5000): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined; // signal invalid
  const v = value.trim();
  if (v.length > max) return undefined;
  return v;
}

/**
 * Validate a user-supplied URL meant to be rendered as an <img src>.
 * Only http(s), capped length. Returns the URL or null (treat null as "drop it").
 */
export function cleanImageUrl(value: unknown, max = 1000): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v.length > max) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return v;
  } catch {
    return null;
  }
}

/** Word count for prose fields (e.g. backstory minimum). */
export function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
