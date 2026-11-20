interface RateEntry {
  timestamps: number[];
}

const buckets = new Map<string, RateEntry>();

export function checkRateLimit(
  key: string,
  maxRequests = 40,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const entry = buckets.get(key) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}
