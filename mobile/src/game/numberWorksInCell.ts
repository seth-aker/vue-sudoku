import type { Cells } from '@/types'
import { peerIndicesOf } from './board'

/**
 * Would placing `value` at `idx` violate any peer constraint?
 *
 * Returns true if the value is safe to place (no peer cell already has it),
 * false otherwise. `value` must be 1..9; 0 is treated as "not a placement"
 * and returns true.
 *
 * Mobile counterpart of `frontend/src/utils/numberWorksInCell.ts`, ported
 * to operate on a flat Cell[] indexed by `idx`.
 */
export function numberWorksInCell(cells: Cells, idx: number, value: number): boolean {
  if (value < 1 || value > 9) return true
  for (const peerIdx of peerIndicesOf(idx)) {
    if (cells[peerIdx].value === value) return false
  }
  return true
}
