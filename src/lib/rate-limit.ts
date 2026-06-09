/**
 * 简易内存速率限制器（Vercel Serverless 适用）
 *
 * 注意：Serverless 冷启动会重置计数器，对暴力破解仍有一定防护作用。
 * 高流量场景建议改用 Vercel WAF 或 Redis 方案。
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 每 5 分钟清理过期条目，避免内存泄漏
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}

interface RateLimitOptions {
  /** 时间窗口（秒） */
  windowSeconds: number;
  /** 窗口内最大请求数 */
  maxAttempts: number;
  /** 限流标识（如 IP 地址） */
  identifier: string;
}

export function checkRateLimit(opts: RateLimitOptions): { allowed: boolean; retryAfter: number } {
  cleanup();

  const { windowSeconds, maxAttempts, identifier } = opts;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // 首次请求或窗口已过期
    store.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}
