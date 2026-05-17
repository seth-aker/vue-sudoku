import { apiFetch, type ApiResult } from '../client'
import type { DifficultyRating } from '@/types'

/** Returned by /auth/token + /auth/register, and used to seed useUserStore. */
export interface UserDTO {
  id: string
  username: string
  role: string
  displayName?: string
  imageUrl?: string
  currentPuzzleId?: string
}

/** /auth/token response. */
export interface TokenResponse {
  token: string
  /** ms since epoch */
  expiresAt: number
  user: UserDTO
}

/** /users/:id/stats response — one row per difficulty the user has played. */
export interface DifficultyStats {
  rating: DifficultyRating
  avgScore: number
  totalStarted: number
  completed: number
  avgTimeSec: number
  totalTimeSec: number
}

/**
 * Exchange username/password for a JWT bearer token. Mobile-only flow;
 * the web client uses /auth/login (session cookie) instead.
 */
export function login(username: string, password: string): Promise<ApiResult<TokenResponse>> {
  return apiFetch<TokenResponse>('/auth/token', {
    method: 'POST',
    body: { username, password },
    auth: false,
  })
}

/**
 * Create a new user. Backend sets a session cookie that mobile ignores; the
 * caller is expected to immediately follow up with `login(...)` to get a JWT.
 * That extra round-trip is the accepted trade-off for not extending the
 * backend's register flow with a token-issuing branch (see MIGRATION_PLAN §8.3).
 */
export function register(
  username: string,
  password: string,
  displayName?: string,
): Promise<ApiResult<UserDTO>> {
  return apiFetch<UserDTO>('/auth/register', {
    method: 'POST',
    body: { username, password, displayName },
    auth: false,
  })
}

/**
 * Validate the current bearer token and return the canonical user record.
 * Returns 401 if the token is missing/expired/invalid; the apiFetch wrapper
 * clears the stored token on 401, so callers don't need to do that.
 */
export function getSelf(): Promise<ApiResult<UserDTO>> {
  return apiFetch<UserDTO>('/users/me')
}

/** Per-difficulty play statistics for the current user. */
export function getUserStats(userId: string): Promise<ApiResult<DifficultyStats[]>> {
  return apiFetch<DifficultyStats[]>(`/users/${encodeURIComponent(userId)}/stats`)
}
