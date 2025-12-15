type Key = string;

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

const buckets = new Map<Key, Bucket>();

export type RateLimitConfig = {
  capacity: number;
  refillPerSecond: number;
};

export async function acquireToken(key: Key, cfg: RateLimitConfig) {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: cfg.capacity, lastRefillMs: now };
  const elapsed = Math.max(0, now - b.lastRefillMs);
  const refill = (elapsed / 1000) * cfg.refillPerSecond;
  b.tokens = Math.min(cfg.capacity, b.tokens + refill);
  b.lastRefillMs = now;

  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return;
  }

  const deficit = 1 - b.tokens;
  const waitMs = Math.ceil((deficit / cfg.refillPerSecond) * 1000);
  buckets.set(key, b);
  await new Promise((r) => setTimeout(r, Math.max(50, waitMs)));
  return acquireToken(key, cfg);
}
