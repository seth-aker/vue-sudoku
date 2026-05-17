/**
 * Build empty/test cell arrays. Mobile counterpart of the web's
 * buildBlankPuzzleRows/buildStandardPuzzleRows — but flat (Cell[81]) and
 * without the dropped `cellId`/`type` fields.
 */
import { CELL_COUNT, type Cell, type Cells } from '@/types'
import { colOf, rowOf } from './board'

/**
 * 81 blank cells (value: 0, candidates: []). Used as the initial state
 * before a puzzle loads.
 */
export function buildBlankCells(): Cells {
  return Array.from({ length: CELL_COUNT }, (_, idx): Cell => ({
    idx,
    value: 0,
    candidates: [],
  }))
}

/**
 * Test-pattern cells where value = ((row + col) % 9) + 1. Used by unit tests
 * to seed a known-good board without hitting the backend.
 */
export function buildStandardCells(): Cells {
  return Array.from({ length: CELL_COUNT }, (_, idx): Cell => ({
    idx,
    value: ((rowOf(idx) + colOf(idx)) % 9) + 1,
    candidates: [],
  }))
}
