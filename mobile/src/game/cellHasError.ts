import type { Cells } from '@/types'
import { peerIndicesOf } from './board'

/**
 * True iff the cell at `idx` has a value that conflicts with any peer cell
 * (same row, column, or block). Empty cells (value 0) are never in error.
 *
 * Mobile counterpart of `frontend/src/utils/cellHasError.ts`, ported to the
 * flat Cell[] shape.
 */
export function cellHasError(cells: Cells, idx: number): boolean {
  const cell = cells[idx]
  if (!cell || cell.value === 0) return false
  for (const peerIdx of peerIndicesOf(idx)) {
    if (cells[peerIdx].value === cell.value) return true
  }
  return false
}
