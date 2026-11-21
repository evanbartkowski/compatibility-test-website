interface RateEntry {
  timestamps: number[];
}

const buckets = new Map<string, RateEntry>();
const MAX_BUCKETS = 5000;

export function checkRateLimit(
  key: string,
  maxRequests = 40,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  key = key.slice(0, 512);
  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }
  const cutoff = now - windowMs;
  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }
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
