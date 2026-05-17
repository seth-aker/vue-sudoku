/**
 * Pure-JS helpers operating on a flat 81-cell array. These functions are
 * the mobile equivalent of the methods that used to live on the
 * `SudokuPuzzle` class in the web app — only here they're free functions
 * over `Cell[]` instead of methods on an instance.
 *
 * All helpers are read-only. Mutating ones (setCell, etc.) live in the game
 * store (Phase 5), not here.
 */
import { BOARD_SIZE, BLOCK_SIZE, type Cell, type Cells } from '@/types'

// ─── coordinate conversions ──────────────────────────────────────────────────

/** idx → row (0..8). */
export const rowOf = (idx: number) => Math.floor(idx / BOARD_SIZE)

/** idx → column (0..8). */
export const colOf = (idx: number) => idx % BOARD_SIZE

/**
 * idx → block (0..8). Blocks are numbered left-to-right, top-to-bottom:
 *   0 1 2
 *   3 4 5
 *   6 7 8
 */
export const blockOf = (idx: number) =>
  Math.floor(rowOf(idx) / BLOCK_SIZE) * BLOCK_SIZE + Math.floor(colOf(idx) / BLOCK_SIZE)

/** (x, y) → idx. x is column (0..8), y is row (0..8). */
export const at = (x: number, y: number) => y * BOARD_SIZE + x

/** True for sane idx values; false otherwise. */
export const isValidIdx = (idx: number) => Number.isInteger(idx) && idx >= 0 && idx < BOARD_SIZE * BOARD_SIZE

// ─── group accessors ─────────────────────────────────────────────────────────

/** Return the 9 cells in the given row (0..8). */
export function getRow(cells: Cells, row: number): Cell[] {
  if (row < 0 || row >= BOARD_SIZE) return []
  const start = row * BOARD_SIZE
  return cells.slice(start, start + BOARD_SIZE)
}

/** Return the 9 cells in the given column (0..8). */
export function getColumn(cells: Cells, col: number): Cell[] {
  if (col < 0 || col >= BOARD_SIZE) return []
  const out: Cell[] = []
  for (let r = 0; r < BOARD_SIZE; r++) out.push(cells[r * BOARD_SIZE + col])
  return out
}

/** Return the 9 cells in the given block (0..8). */
export function getBlock(cells: Cells, block: number): Cell[] {
  if (block < 0 || block >= BOARD_SIZE) return []
  const blockRow = Math.floor(block / BLOCK_SIZE)
  const blockCol = block % BLOCK_SIZE
  const out: Cell[] = []
  for (let r = 0; r < BLOCK_SIZE; r++) {
    for (let c = 0; c < BLOCK_SIZE; c++) {
      out.push(cells[(blockRow * BLOCK_SIZE + r) * BOARD_SIZE + (blockCol * BLOCK_SIZE + c)])
    }
  }
  return out
}

// ─── peers (for constraint propagation) ──────────────────────────────────────

/**
 * Set of idx values that share a row, column, or block with the given idx —
 * excluding the cell itself. Always 20 entries for a standard 9x9 board.
 */
export function peerIndicesOf(idx: number): number[] {
  const r = rowOf(idx)
  const c = colOf(idx)
  const seen = new Set<number>()
  for (let i = 0; i < BOARD_SIZE; i++) {
    seen.add(r * BOARD_SIZE + i)         // row
    seen.add(i * BOARD_SIZE + c)         // column
  }
  const blockRow = Math.floor(r / BLOCK_SIZE) * BLOCK_SIZE
  const blockCol = Math.floor(c / BLOCK_SIZE) * BLOCK_SIZE
  for (let dr = 0; dr < BLOCK_SIZE; dr++) {
    for (let dc = 0; dc < BLOCK_SIZE; dc++) {
      seen.add((blockRow + dr) * BOARD_SIZE + (blockCol + dc))
    }
  }
  seen.delete(idx)
  return Array.from(seen)
}

// ─── status / validation ─────────────────────────────────────────────────────

/**
 * Status of a cell relative to the original (clue) snapshot. Used for styling:
 * - 'prefilled' renders bold and non-editable (locked by the puzzle).
 * - 'edited' is a user-entered value.
 * - 'blank' is empty.
 */
export type CellStatus = 'prefilled' | 'edited' | 'blank'

export function cellStatus(cell: Cell, original: Cell): CellStatus {
  if (original.value !== 0) return 'prefilled'
  return cell.value !== 0 ? 'edited' : 'blank'
}

/**
 * True iff every cell is filled AND no cell conflicts with a peer.
 * (Not a uniqueness check — that's the backend's job via `solved_cells`.)
 */
export function isSolved(cells: Cells): boolean {
  if (cells.length !== BOARD_SIZE * BOARD_SIZE) return false
  for (const cell of cells) {
    if (cell.value === 0) return false
  }
  return !hasAnyError(cells)
}

/**
 * True iff ANY filled cell conflicts with a peer.
 */
export function hasAnyError(cells: Cells): boolean {
  for (let idx = 0; idx < cells.length; idx++) {
    if (cells[idx].value === 0) continue
    for (const peerIdx of peerIndicesOf(idx)) {
      if (cells[peerIdx].value === cells[idx].value) return true
    }
  }
  return false
}

/**
 * Return a new Cell[] with candidates auto-filled. For every empty cell the
 * candidates list contains exactly those 1..9 values not present in any peer.
 * Filled cells keep their existing (typically empty) candidates.
 *
 * Pure — does not mutate the input.
 */
export function computeCandidates(cells: Cells): Cells {
  return cells.map((cell, idx) => {
    if (cell.value !== 0) return cell
    const peerValues = new Set<number>()
    for (const peerIdx of peerIndicesOf(idx)) {
      const v = cells[peerIdx].value
      if (v !== 0) peerValues.add(v)
    }
    const candidates: number[] = []
    for (let v = 1; v <= BOARD_SIZE; v++) {
      if (!peerValues.has(v)) candidates.push(v)
    }
    return { ...cell, candidates }
  })
}

/**
 * Return a new Cell[] with all candidates cleared.
 */
export function clearAllCandidates(cells: Cells): Cells {
  return cells.map((cell) => (cell.candidates.length === 0 ? cell : { ...cell, candidates: [] }))
}
