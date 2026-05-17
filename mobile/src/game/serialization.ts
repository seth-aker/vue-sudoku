/**
 * Wire-format serialization for cells, candidates, and actions.
 *
 * String formats (server <-> client, unchanged from web):
 *   - cells:      81-character string of digits 0..9 (0 = empty)
 *   - candidates: 81 segments of digits 1..9 separated by ':' (empty segment = no candidates)
 *
 * Numeric formats (action-history encoding, INCOMPATIBLE with web's encoding):
 *   - cell:   20 bits   |  9 cand-mask | 4 value | 7 idx |
 *   - action: 21 bits   |  1 isParent  | 20 cell                  |
 *
 * The mobile encoding drops the 2 "type" bits the web encoding used, since
 * the `type` field no longer exists on `Cell`. See MIGRATION_PLAN §3.5.5.
 */
import { BOARD_SIZE, CELL_COUNT, type Action, type Cell, type Cells } from '@/types'

// ─── string format (server wire) ─────────────────────────────────────────────

/**
 * Build a Cell[] from the backend's string representation.
 *
 * - `originalCellsStr`: 81-char digit string, the clue/original puzzle.
 * - `currentCellsStr`: 81-char digit string, current state. If absent, falls back to original.
 * - `candidatesStr`: colon-separated cell candidates (e.g. "1234:78::5..."). Optional.
 *
 * Always returns an 81-length array. Garbage characters → 0. Out-of-range
 * indices fall back to value 0 / no candidates.
 */
export function deserializeCells(
  originalCellsStr: string,
  currentCellsStr?: string,
  candidatesStr?: string,
): Cells {
  const original = stringToValueArray(originalCellsStr)
  const current = currentCellsStr ? stringToValueArray(currentCellsStr) : original
  const candidates = candidatesStr ? parseCandidatesString(candidatesStr) : undefined

  const out: Cells = new Array(CELL_COUNT)
  for (let idx = 0; idx < CELL_COUNT; idx++) {
    const originalVal = original[idx] ?? 0
    const currentVal = current[idx] ?? originalVal
    out[idx] = {
      idx,
      value: currentVal,
      candidates: candidates?.[idx] ?? [],
    }
  }
  return out
}

/** Serialize the value of every cell into the 81-character digit string. */
export function serializeCellsToString(cells: Cells): string {
  let out = ''
  for (let i = 0; i < CELL_COUNT; i++) {
    out += String(cells[i]?.value ?? 0)
  }
  return out
}

/** Serialize candidates into the colon-separated string. */
export function serializeCandidatesToString(cells: Cells): string {
  const parts: string[] = new Array(CELL_COUNT)
  for (let i = 0; i < CELL_COUNT; i++) {
    parts[i] = cells[i]?.candidates.join('') ?? ''
  }
  return parts.join(':')
}

// ─── numeric format (action history) ─────────────────────────────────────────

/**
 * Encode a Cell as a single number.
 *
 * Layout (20 bits total):
 *   bits  0..6   : idx (0..80)
 *   bits  7..10  : value (0..9)
 *   bits 11..19  : candidate mask (bit n-1 set => n is a candidate)
 */
export function serializeCell(cell: Cell): number {
  const mask = cell.candidates.reduce((m, c) => m | (1 << (c - 1)), 0)
  return ((mask & 0x1ff) << 11) | ((cell.value & 0xf) << 7) | (cell.idx & 0x7f)
}

export function deserializeCell(n: number): Cell {
  const idx = n & 0x7f
  const value = (n >> 7) & 0xf
  let mask = (n >> 11) & 0x1ff
  const candidates: number[] = []
  while (mask !== 0) {
    candidates.push(ctz(mask) + 1)
    mask &= mask - 1
  }
  return { idx, value, candidates }
}

/**
 * Encode an Action as a single number. 21 bits total: 1 bit for isParent
 * stacked on top of the 20-bit cell encoding.
 */
export function serializeAction(action: Action): number {
  return ((action.isParent ? 1 : 0) << 20) | serializeCell(action.prevCell)
}

export function deserializeAction(n: number): Action {
  return {
    isParent: ((n >> 20) & 1) === 1,
    prevCell: deserializeCell(n & 0xfffff),
  }
}

// ─── internals ───────────────────────────────────────────────────────────────

function stringToValueArray(str: string): number[] {
  const out: number[] = new Array(CELL_COUNT).fill(0)
  for (let i = 0; i < CELL_COUNT && i < str.length; i++) {
    const ch = str.charCodeAt(i) - 48 // '0'
    out[i] = ch >= 0 && ch <= 9 ? ch : 0
  }
  return out
}

function parseCandidatesString(str: string): number[][] {
  const segments = str.split(':')
  const out: number[][] = new Array(CELL_COUNT).fill(0).map(() => [])
  for (let i = 0; i < CELL_COUNT && i < segments.length; i++) {
    const seg = segments[i] ?? ''
    const cands: number[] = []
    for (let j = 0; j < seg.length; j++) {
      const v = seg.charCodeAt(j) - 48
      if (v >= 1 && v <= BOARD_SIZE) cands.push(v)
    }
    out[i] = cands
  }
  return out
}

/** Count trailing zeroes for the lowest set bit. Returns 32 for 0. */
function ctz(n: number): number {
  if (n === 0) return 32
  let count = 0
  while ((n & 1) === 0) {
    count++
    n >>= 1
  }
  return count
}
