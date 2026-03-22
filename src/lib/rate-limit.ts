/**
 * Rate Limiter for NomadWay API
 * In-memory for development, Redis-ready for production
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations per endpoint type
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter limits
  auth: { windowMs: 60 * 1000, maxRequests: 10 },       // 10 req/min
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 req/15min (brute force protection)
  
  // API endpoints - moderate limits
  api: { windowMs: 60 * 1000, maxRequests: 100 },      // 100 req/min
  read: { windowMs: 60 * 1000, maxRequests: 200 },     // 200 req/min (GET)
  write: { windowMs: 60 * 1000, maxRequests: 50 },     // 50 req/min (POST/PUT/DELETE)
  
  // Form submissions - strict limits
  form: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 req/hour
};

/**
 * Get client IP from request
 */
function getClientIP(request: Request): string {
  // Check various headers for real IP (reverse proxy aware)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default (should not happen in production)
  return 'unknown';
}

/**
 * Check rate limit for a client
 * Returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  request: Request,
  type: keyof typeof RATE_LIMITS = 'api'
): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  retryAfter?: number;
} {
  const config = RATE_LIMITS[type] || RATE_LIMITS.api;
  const clientIP = getClientIP(request);
  const key = `${type}:${clientIP}`;
  const now = Date.now();
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count++;
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;
  
  // Clean up old entries periodically (every 1000 requests)
  if (rateLimitStore.size > 1000) {
    const cutoff = now - config.windowMs;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < cutoff) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
  };
}

/**
 * Rate limit middleware for API routes
 * Returns NextResponse with 429 if rate limited
 */
export function rateLimitMiddleware(
  request: Request,
  type: keyof typeof RATE_LIMITS = 'api'
): Response | null {
  const result = checkRateLimit(request, type);
  
  if (!result.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter),
        'X-RateLimit-Limit': String(RATE_LIMITS[type].maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetTime)
      }
    });
  }
  
  return null; // No rate limit hit
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  request: Request,
  type: keyof typeof RATE_LIMITS = 'api'
): void {
  const result = checkRateLimit(request, type);
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMITS[type].maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetTime));
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit<T extends Request>(
  handler: (request: T) => Promise<Response>,
  type: keyof typeof RATE_LIMITS = 'api'
): (request: T) => Promise<Response> {
  return async (request: T) => {
    const rateLimitResponse = rateLimitMiddleware(request, type);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const response = await handler(request);
    addRateLimitHeaders(response, request, type);
    return response;
  };
}