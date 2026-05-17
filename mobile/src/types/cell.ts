/**
 * A single sudoku cell. Mobile uses a flat 81-cell array; `idx` is the
 * 0..80 position (idx = y*9 + x). `value` is 0 for empty, 1..9 otherwise.
 *
 * NOTE: No `type` field (web's 'prefilled' | 'edited' | 'blank') and no
 * `cellId`. "Prefilled" is derived at render time by comparing against the
 * `originalCells` snapshot — see `cellStatus()` in src/game/board.ts.
 */
export interface Cell {
  /** Position in the 81-cell array. Redundant with array index but kept for actions/selection. */
  idx: number
  /** 0 = empty, 1..9 = filled. */
  value: number
  /** Sorted, unique, values 1..9. Empty array if none. */
  candidates: number[]
}

/** Convenience alias. Always length 81 for a standard board. */
export type Cells = Cell[]
