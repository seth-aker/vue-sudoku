import { SignJWT, jwtVerify } from 'jose'
import { authConfig } from '../config'

export interface JwtIdentity {
  id: string
  username: string
  role: string
}

function getSecret(): Uint8Array {
  if (!authConfig.jwtSecret) {
    throw new Error('Missing JWT secret (set JWT_SECRET or SESSION_SECRET)')
  }
  return new TextEncoder().encode(authConfig.jwtSecret)
}

/**
 * Issue a signed JWT for the mobile bearer-token flow. `sub` is the user id;
 * username/role are carried as claims so protected routes can resolve identity
 * without a DB hit.
 */
export async function signToken(identity: JwtIdentity): Promise<string> {
  return await new SignJWT({
    username: identity.username,
    role: identity.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(identity.id)
    .setIssuedAt()
    .setExpirationTime(authConfig.jwtExpiresIn)
    .sign(getSecret())
}

/**
 * Verify a bearer token. Returns the identity on success, or undefined if the
 * token is missing, malformed, expired, or has an invalid signature.
 */
export async function verifyToken(
  token: string,
): Promise<JwtIdentity | undefined> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.username !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return undefined
    }
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    }
  } catch {
    return undefined
  }
}
