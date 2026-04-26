// Rate limiter en memoria (suficiente para MVP en una sola instancia).
// Para producción multi-región, sustituir por Upstash/Redis o Supabase RPC.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  options?: { windowSeconds?: number; max?: number },
): RateLimitResult {
  const windowSeconds =
    options?.windowSeconds ??
    Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);
  const max =
    options?.max ?? Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10);

  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowSeconds * 1000 };
    store.set(key, fresh);
    return { allowed: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: max - bucket.count, resetAt: bucket.resetAt };
}
