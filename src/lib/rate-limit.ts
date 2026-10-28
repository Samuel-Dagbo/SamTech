/**
 * Sliding-window in-memory rate limiter.
 *
 * Scope: per server instance / serverless container. Sufficient for the
 * current traffic level; a Redis-backed adapter (e.g. Upstash REST) is a
 * documented follow-up for strict cross-instance limits. See
 * docs/MODERNIZATION-PLAN.md §5.
 */

type Bucket = { hits: number[] };

const store = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();

  if (store.size > MAX_KEYS) {
    for (const [existingKey, bucket] of store) {
      if (!bucket.hits.some((hit) => now - hit < windowMs)) {
        store.delete(existingKey);
      }
    }
  }

  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((hit) => now - hit < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    store.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  store.set(key, bucket);

  return {
    ok: true,
    remaining: limit - bucket.hits.length,
    retryAfterSeconds: 0,
  };
}
