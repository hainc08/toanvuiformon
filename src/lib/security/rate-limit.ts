import { ApiError } from "@/lib/http";

/**
 * In-memory sliding-window rate limiter.
 * Suitable for the single-instance VPS deployment (one Node.js process).
 * If the app is scaled horizontally, replace the store with a shared one (e.g. PostgreSQL/Redis).
 */
type Bucket = { hits: number[] };
const store = new Map<string, Bucket>();
let lastSweep = Date.now();

export interface RateLimitRule {
  name: string;
  limit: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  generate: { name: "generate", limit: 10, windowMs: 60_000 },
  pdf: { name: "pdf", limit: 30, windowMs: 60_000 },
  login: { name: "login", limit: 5, windowMs: 15 * 60_000 },
  report: { name: "report", limit: 5, windowMs: 10 * 60_000 },
  import: { name: "import", limit: 10, windowMs: 10 * 60_000 },
} satisfies Record<string, RateLimitRule>;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.hits.length === 0 || now - (bucket.hits[bucket.hits.length - 1] ?? 0) > 60 * 60_000) store.delete(key);
  }
}

export function checkRateLimit(rule: RateLimitRule, key: string, now = Date.now()): { ok: boolean; retryAfterSec: number; remaining: number } {
  if (process.env.RATE_LIMIT_DISABLED === "true") return { ok: true, retryAfterSec: 0, remaining: rule.limit };
  sweep(now);
  const id = `${rule.name}:${key}`;
  const bucket = store.get(id) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < rule.windowMs);
  if (bucket.hits.length >= rule.limit) {
    const oldest = bucket.hits[0] ?? now;
    store.set(id, bucket);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((rule.windowMs - (now - oldest)) / 1000)), remaining: 0 };
  }
  bucket.hits.push(now);
  store.set(id, bucket);
  return { ok: true, retryAfterSec: 0, remaining: rule.limit - bucket.hits.length };
}

/** Throws a 429 ApiError when the limit is exceeded. */
export function enforceRateLimit(rule: RateLimitRule, key: string): void {
  const res = checkRateLimit(rule, key);
  if (!res.ok) {
    throw new ApiError(429, "RATE_LIMITED", "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.", undefined, {
      "Retry-After": String(res.retryAfterSec),
    });
  }
}

export function resetRateLimits(): void {
  store.clear();
}
