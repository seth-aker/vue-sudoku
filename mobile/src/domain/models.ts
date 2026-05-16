/**
 * Shared domain types. The puzzle DTOs use `puzzleId` (not `_id`) to match the
 * updated backend contract. `PLAYABLE_DIFFICULTIES` lives here (not in the
 * navigation layer) so the store/services can use it without importing routing
 * (plan §7.10).
 */
import type { Cell } from './cell';

export type DifficultyRating =
  | 'beginner'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'impossible';

export interface Difficulty {
  rating: DifficultyRating;
  score?: number;
}

export const PLAYABLE_DIFFICULTIES: readonly DifficultyRating[] = [
  'beginner',
  'easy',
  'medium',
];

export const isPlayableDifficulty = (
  value: unknown,
): value is DifficultyRating =>
  typeof value === 'string' &&
  (PLAYABLE_DIFFICULTIES as readonly string[]).includes(value);

/**
 * Undo/redo record. Uses `idx` directly (the old x/y pair is derivable via
 * xOf/yOf and is no longer stored).
 */
export interface Action {
  idx: number;
  prevCell: Cell;
  isParent: boolean;
}

export interface SaveGameOptions {
  keepalive?: boolean;
}

export type GameState = 'playing' | 'solved' | 'not-started' | 'paused';

/* ---- API DTOs (puzzleId, not _id) ---- */

export interface NewPuzzleDto {
  puzzleId: string;
  cells: string;
  candidates?: string;
  difficulty: Difficulty;
}

export interface UserPuzzleDto {
  puzzleId: string;
  isCompleted: boolean;
  currentCells: string;
  currentCandidates: string;
  time: number;
  originalCells: string;
  difficulty: Difficulty;
  actions?: number[];
}

export interface UpdateUserPuzzleDto {
  puzzleId: string;
  cells: string;
  candidates: string;
  time: number;
  isCompleted: boolean;
  actions: number[];
}

/* ---- User ---- */

export interface UserDto {
  id: string;
  username: string;
  displayName?: string;
  imageUrl?: string;
  currentPuzzleId?: string;
  role: string;
}

/** Login/register responses additively include a JWT (web ignores it). */
export interface AuthResponseDto extends UserDto {
  token: string;
}

export interface DifficultyStats {
  rating: DifficultyRating;
  avgScore: number;
  totalStarted: number;
  completed: number;
  avgTimeSec: number;
  totalTimeSec: number;
}

export type UserStats = DifficultyStats[];
