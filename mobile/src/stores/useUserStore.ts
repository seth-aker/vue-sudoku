import { create } from 'zustand'
import { setToken, clearToken, setOnUnauthorized, userService } from '@/api'
import type { UserDTO, DifficultyStats } from '@/api'

interface UserState {
  // — fields —
  id: string | null
  username: string | null
  displayName: string | null
  role: string | null
  imageUrl: string | null
  currentPuzzleId: string | null
  userStats: DifficultyStats[]
  loading: boolean
  /** Most recent auth-flow error message, surfaced inline in the AuthSheet forms. */
  error: string | null

  // — actions —
  /** Mobile login: POST /auth/token → store JWT → seed state. */
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>
  /** Register + immediate token-exchange. */
  register: (username: string, password: string, displayName?: string) => Promise<{ ok: boolean; message?: string }>
  /** Clear token + reset state. No server call (JWT is stateless). */
  logout: () => Promise<void>
  /** Session-resume on launch. Silent no-op when there's no token. */
  getSelf: () => Promise<void>
  /** Pull per-difficulty stats for the current user. */
  refreshStats: () => Promise<void>
  /** Reset to anonymous state without touching storage. Used by the 401 handler. */
  reset: () => void
}

const ANONYMOUS = {
  id: null,
  username: null,
  displayName: null,
  role: null,
  imageUrl: null,
  currentPuzzleId: null,
  userStats: [] as DifficultyStats[],
  error: null,
}

function seedFromUser(u: UserDTO) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName ?? null,
    role: u.role,
    imageUrl: u.imageUrl ?? null,
    currentPuzzleId: u.currentPuzzleId ?? null,
  }
}

export const useUserStore = create<UserState>((set, get) => ({
  ...ANONYMOUS,
  loading: false,

  async login(username, password) {
    set({ loading: true, error: null })
    const res = await userService.login(username, password)
    if (!res.ok) {
      set({ loading: false, error: res.message })
      return { ok: false, message: res.message }
    }
    await setToken(res.body.token)
    set({ ...seedFromUser(res.body.user), loading: false, error: null })
    return { ok: true }
  },

  async register(username, password, displayName) {
    set({ loading: true, error: null })
    const regRes = await userService.register(username, password, displayName)
    if (!regRes.ok) {
      set({ loading: false, error: regRes.message })
      return { ok: false, message: regRes.message }
    }
    // Backend created a session cookie for the web flow; we ignore that and
    // immediately call /auth/token to mint our JWT.
    const tokenRes = await userService.login(username, password)
    if (!tokenRes.ok) {
      set({ loading: false, error: tokenRes.message })
      return { ok: false, message: tokenRes.message }
    }
    await setToken(tokenRes.body.token)
    set({ ...seedFromUser(tokenRes.body.user), loading: false, error: null })
    return { ok: true }
  },

  async logout() {
    await clearToken()
    set({ ...ANONYMOUS, loading: false })
  },

  async getSelf() {
    set({ loading: true })
    const res = await userService.getSelf()
    if (!res.ok) {
      // apiFetch already cleared the token on 401. For any other failure, we
      // also reset (we don't trust the previous state) — but quietly.
      set({ ...ANONYMOUS, loading: false })
      return
    }
    set({ ...seedFromUser(res.body), loading: false })
  },

  async refreshStats() {
    const id = get().id
    if (!id) return
    const res = await userService.getUserStats(id)
    if (res.ok) set({ userStats: res.body })
  },

  reset() {
    set({ ...ANONYMOUS, loading: false })
  },
}))

/** Selector helpers — use these in components to avoid full-store subscriptions. */
export const selectIsAuthenticated = (s: UserState): boolean => s.id !== null

// Wire the apiFetch 401 hook to reset the store. Runs once at module load,
// before any UI mounts.
setOnUnauthorized(() => {
  useUserStore.getState().reset()
})
