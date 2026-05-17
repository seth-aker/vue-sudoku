import { SignJWT, jwtVerify, errors as joseErrors } from 'jose'
import { authConfig } from './config'

export interface JwtClaims {
  /** user id (subject) */
  sub: string
  /** user role */
  role: string
  /** issued-at, seconds since epoch */
  iat?: number
  /** expiration, seconds since epoch */
  exp?: number
}

const encoder = new TextEncoder()

function getSecretKey() {
  return encoder.encode(authConfig.jwtSecret)
}

/**
 * Parse a TTL string like "7d", "15m", "3600s", or a bare seconds number
 * into a number of seconds.
 */
export function parseTtlToSeconds(ttl: string): number {
  const match = /^(\d+)\s*(s|m|h|d)?$/.exec(ttl.trim())
  if (!match) {
    throw new Error(`Invalid JWT TTL: "${ttl}" (expected forms: "3600", "15m", "7d")`)
  }
  const n = Number.parseInt(match[1], 10)
  const unit = match[2] ?? 's'
  switch (unit) {
    case 's': return n
    case 'm': return n * 60
    case 'h': return n * 60 * 60
    case 'd': return n * 60 * 60 * 24
    default: throw new Error(`Invalid JWT TTL unit: ${unit}`)
  }
}

/**
 * Sign a JWT for the given user.
 * Returns the compact-serialization token plus its absolute expiry (ms since epoch).
 */
export async function signJwt(payload: Pick<JwtClaims, 'sub' | 'role'>): Promise<{ token: string; expiresAt: number }> {
  const ttlSeconds = parseTtlToSeconds(authConfig.jwtTtl)
  const nowSeconds = Math.floor(Date.now() / 1000)
  const expSeconds = nowSeconds + ttlSeconds

  const token = await new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt(nowSeconds)
    .setExpirationTime(expSeconds)
    .sign(getSecretKey())

  return { token, expiresAt: expSeconds * 1000 }
}

/**
 * Verify a JWT. Returns the decoded claims on success, or null on any failure.
 * Errors are swallowed by design so callers can treat "invalid" and "absent"
 * the same way; the auth middleware just returns 401.
 */
export async function verifyJwt(token: string): Promise<JwtClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'] })
    if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
      return null
    }
    return {
      sub: payload.sub,
      role: payload.role,
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
    }
  } catch (err) {
    if (err instanceof joseErrors.JOSEError) {
      return null
    }
    return null
  }
}

/**
 * Extract a bearer token from an Authorization header value.
 * Returns null if the header is missing or not a Bearer token.
 */
export function parseBearer(headerValue: string | undefined): string | null {
  if (!headerValue) return null
  const [scheme, token] = headerValue.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token.trim() || null
}
