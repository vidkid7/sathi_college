import { NextRequest, NextResponse } from "next/server";

type HeaderSource = Headers | Record<string, string | string[] | undefined>;
type RateLimitBucket = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  blockMs?: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfter: number;
};

const globalForSecurity = globalThis as typeof globalThis & {
  __sathiRateLimitBuckets?: Map<string, RateLimitBucket>;
};

const buckets = globalForSecurity.__sathiRateLimitBuckets ?? new Map<string, RateLimitBucket>();
globalForSecurity.__sathiRateLimitBuckets = buckets;

export function readHeader(headers: HeaderSource | undefined, name: string) {
  if (!headers) return null;
  if (typeof (headers as Headers).get === "function") return (headers as Headers).get(name);
  const lowerName = name.toLowerCase();
  const record = headers as Record<string, string | string[] | undefined>;
  const value = record[name] ?? record[lowerName];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function getClientIp(input: NextRequest | { headers?: HeaderSource } | HeaderSource | undefined) {
  let headers: HeaderSource | undefined;
  if (!input) {
    headers = undefined;
  } else if (input instanceof NextRequest) {
    headers = input.headers;
  } else if (typeof (input as Headers).get === "function") {
    headers = input as Headers;
  } else if (typeof input === "object" && "headers" in input && typeof (input as any).headers === "object") {
    headers = (input as { headers?: HeaderSource }).headers;
  } else {
    headers = input as HeaderSource;
  }
  const forwarded = readHeader(headers, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return readHeader(headers, "x-real-ip") || readHeader(headers, "cf-connecting-ip") || "unknown";
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if ((bucket.blockedUntil ?? bucket.resetAt) < now) buckets.delete(bucketKey);
    }
  }

  const current = buckets.get(key);
  if (current?.blockedUntil && current.blockedUntil > now) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((current.blockedUntil - now) / 1000)
    };
  }

  const bucket =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : current;

  bucket.count += 1;
  if (bucket.count > options.limit) {
    bucket.blockedUntil = now + (options.blockMs ?? options.windowMs);
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil(((bucket.blockedUntil ?? bucket.resetAt) - now) / 1000)
    };
  }

  buckets.set(key, bucket);
  return {
    ok: true,
    remaining: Math.max(0, options.limit - bucket.count),
    retryAfter: Math.ceil((bucket.resetAt - now) / 1000)
  };
}

export function rateLimitRequest(req: NextRequest, scope: string, options: RateLimitOptions) {
  return rateLimit(`${scope}:${getClientIp(req)}`, options);
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function rateLimitedJson(result: RateLimitResult) {
  const response = NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  response.headers.set("Retry-After", String(Math.max(1, result.retryAfter)));
  return withSecurityHeaders(response);
}

export function withSecurityHeaders(response: NextResponse, req?: NextRequest) {
  const isHttps = req?.nextUrl.protocol === "https:";
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.whatsapp.com https://wa.me",
      "worker-src 'self' blob:"
    ].join("; ")
  );
  if (isHttps) {
    response.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  return response;
}

export function isSafeUrl(value: unknown, { allowRelative = false }: { allowRelative?: boolean } = {}) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
