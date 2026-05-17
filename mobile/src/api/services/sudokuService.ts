import { apiFetch, type ApiResult } from '../client'
import type { Difficulty, DifficultyRating } from '@/types'

/** /sudoku/new response. */
export interface NewPuzzleResponse {
  puzzleId: string
  cells: string                  // 81-char digit string
  candidates?: string            // colon-separated cell candidates
  difficulty: Difficulty
}

/** /sudoku/:puzzleId response. */
export interface UserPuzzleResponse {
  puzzleId: string
  isCompleted: boolean
  currentCells: string
  currentCandidates: string
  time: number                   // elapsed seconds
  originalCells: string
  difficulty: Difficulty
  actions: number[]              // serialized action history (see game/serialization.ts)
}

/** Body for PUT /sudoku/:puzzleId. `puzzleId` lives in the URL only. */
export interface UpdatePuzzleBody {
  cells: string
  candidates: string
  isCompleted: boolean
  actions: number[]
  time: number
}

/**
 * Claim a new puzzle for the given difficulty. Server-side this picks an
 * unsolved puzzle, records it as the user's current puzzle, and increments
 * the puzzle pool's generator if it's running low.
 *
 * Anonymous callers can hit this too (the wrapper sends the token only if
 * one is set). When unauthed the backend just returns a puzzle without
 * recording state.
 */
export function getNewPuzzle(difficulty: DifficultyRating): Promise<ApiResult<NewPuzzleResponse>> {
  return apiFetch<NewPuzzleResponse>(`/sudoku/new?difficulty=${encodeURIComponent(difficulty)}`)
}

/** Fetch the user's saved state for a specific puzzle. Requires auth. */
export function getUserPuzzle(puzzleId: string): Promise<ApiResult<UserPuzzleResponse>> {
  return apiFetch<UserPuzzleResponse>(`/sudoku/${encodeURIComponent(puzzleId)}`)
}

/**
 * Save the user's progress on a puzzle. Backend returns 204; the wrapper
 * surfaces that as `{ ok: true, status: 204, body: undefined }`.
 */
export function updateUserPuzzle(
  puzzleId: string,
  body: UpdatePuzzleBody,
): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/sudoku/${encodeURIComponent(puzzleId)}`, {
    method: 'PUT',
    body,
  })
}
