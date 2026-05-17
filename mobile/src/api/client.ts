import { API_BASE_URL } from '@/config'
import { clearToken, getToken } from './tokenStorage'

/**
 * Caller-facing result of an API call. Success carries the parsed JSON body;
 * failure carries a status code + best-effort error message. Throwing on
 * network/parsing errors is what the wrapper does internally; the public
 * surface uses this discriminated union so call sites can use a single
 * pattern (`if (!res.ok) ...`) instead of mixing try/catch and status checks.
 */
export type ApiResult<T> =
  | { ok: true; status: number; body: T }
  | { ok: false; status: number; message: string; issues?: unknown }

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  /** Set false to skip Authorization header even if a token exists (e.g. login/register/token). */
  auth?: boolean
  /** Optional listener invoked when the server returns 401 (after token is cleared). */
  onUnauthorized?: () => void
}

/**
 * Singleton callback fired when the wrapper sees a 401. The user store
 * registers itself here at boot to reset auth state app-wide. Keeping this
 * out of React context avoids circular imports between the store and the
 * api client.
 */
let globalUnauthorizedHandler: (() => void) | null = null

export function setOnUnauthorized(handler: (() => void) | null) {
  globalUnauthorizedHandler = handler
}

/**
 * Thin fetch wrapper. Adds JSON content type + bearer token, normalizes the
 * response into ApiResult, and handles 401 by clearing the stored token and
 * notifying the global handler.
 *
 * Does NOT retry. Does NOT refresh (single-JWT design — when it expires, the
 * user logs in again).
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<ApiResult<T>> {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  if (opts.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (opts.auth !== false) {
    const token = await getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${API_BASE_URL}${path}`
  const method = opts.method ?? 'GET'

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Network error'
    if (__DEV__) {
      // Surface failed requests in Metro's logs so users can see the URL and
      // diagnose host/port issues (e.g. wrong API_BASE_URL on emulator).
      // eslint-disable-next-line no-console
      console.warn(`[api] ${method} ${url} failed: ${errMessage}`)
    }
    return {
      ok: false,
      status: 0,
      message: `Could not reach ${url}: ${errMessage}`,
    }
  }

  if (res.status === 401) {
    await clearToken()
    globalUnauthorizedHandler?.()
    opts.onUnauthorized?.()
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized',
    }
  }

  // 204 / 205 carry no body by spec.
  if (res.status === 204 || res.status === 205) {
    return { ok: true, status: res.status, body: undefined as T }
  }

  // Try JSON. If the server sent text/html (e.g. a misconfigured proxy), surface
  // the raw text in the message so we have something to debug.
  const text = await res.text()
  let parsed: unknown = undefined
  try {
    parsed = text.length > 0 ? JSON.parse(text) : undefined
  } catch {
    // Non-JSON body.
  }

  if (!res.ok) {
    const errObj = (parsed ?? {}) as { message?: string; issues?: unknown }
    return {
      ok: false,
      status: res.status,
      message: errObj.message ?? text ?? `HTTP ${res.status}`,
      issues: errObj.issues,
    }
  }

  return { ok: true, status: res.status, body: parsed as T }
}
