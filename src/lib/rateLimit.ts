// Lightweight in-memory fixed-window rate limiter.
//
// NOTE: This is per-process. On serverless (Vercel) each instance has its own
// memory, so this is a best-effort first layer, not a hard guarantee. For
// production-grade limiting across instances, back this with Upstash Redis /
// Vercel KV. It still meaningfully blunts bursty abuse from a single client.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodically evict expired buckets so the map doesn't grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * @param key      Unique identifier (e.g. `apply:<ip>` or `apply:<discordId>`).
 * @param limit    Max requests allowed within the window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count++;
  return { allowed: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

/** Best-effort client IP from common proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
