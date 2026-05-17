import type { Cell } from './cell'

/**
 * A single entry in the undo/redo history. `prevCell` is the cell's state
 * BEFORE the change (its `idx` field says where), and `isParent` marks the
 * boundary of a "compound" action (e.g. auto-candidate updates triggered by
 * a single user move group under one parent so a single undo reverts them all).
 *
 * Simpler than the web shape — no redundant `x`, `y` fields; `prevCell.idx`
 * is the source of truth.
 */
export interface Action {
  prevCell: Cell
  isParent: boolean
}
