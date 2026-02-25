import { NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}

interface RateLimitConfig {
  /** Unique identifier for this limiter (e.g. "api-health", "auth-login") */
  key: string
  /** Max requests allowed in the window */
  limit: number
  /** Window size in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup()

  const storeKey = `${config.key}:${identifier}`
  const now = Date.now()
  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: now + config.windowSeconds * 1000,
    }
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count++
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return '127.0.0.1'
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
  return NextResponse.json(
    { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    }
  )
}

export const RATE_LIMITS = {
  /** OpenAI API calls — expensive, strict limit */
  analyzeHealth: { key: 'analyze-health', limit: 5, windowSeconds: 60 },
  /** Auth attempts */
  auth: { key: 'auth', limit: 10, windowSeconds: 60 },
  /** Write operations (post, comment, evaluate) */
  write: { key: 'write', limit: 20, windowSeconds: 60 },
  /** Read/search operations */
  read: { key: 'read', limit: 60, windowSeconds: 60 },
  /** Account deletion — very strict */
  deleteAccount: { key: 'delete-account', limit: 3, windowSeconds: 3600 },
} as const
