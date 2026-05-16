/**
 * Sudoku rule logic over the flat array.
 *
 * Optimization (plan §7.2): the 20 peers of every cell (same row, column, and
 * block, excluding self) are precomputed once into a static table and reused by
 * conflict detection and candidate validation — instead of recomputing
 * row/col/block slices on every call as the web app did. This also collapses
 * the old near-duplicate cellHasError / numberWorksInCell logic.
 */
import { CELL_COUNT, Cell, EMPTY, blockOf, xOf, yOf } from './cell';

/** calcBlockNum(idx) -> 0..8 (kept for parity with the web util name). */
export const calcBlockNum = blockOf;

/** PEERS[idx] = the 20 indices that share a row, column, or block with idx. */
export const PEERS: readonly (readonly number[])[] = (() => {
  const table: number[][] = [];
  for (let idx = 0; idx < CELL_COUNT; idx++) {
    const x = xOf(idx);
    const y = yOf(idx);
    const block = blockOf(idx);
    const peers = new Set<number>();
    for (let other = 0; other < CELL_COUNT; other++) {
      if (other === idx) continue;
      if (xOf(other) === x || yOf(other) === y || blockOf(other) === block) {
        peers.add(other);
      }
    }
    table[idx] = [...peers];
  }
  return table;
})();

/** True if the (non-empty) cell at idx conflicts with any peer. */
export const cellHasError = (cells: Cell[], idx: number): boolean => {
  const value = cells[idx]?.value;
  if (!value) return false; // empty (0) or missing
  for (const p of PEERS[idx]) {
    if (cells[p].value === value) return true;
  }
  return false;
};

/** True if `candidate` can legally go in the (assumed empty) cell at idx. */
export const numberWorksInCell = (
  cells: Cell[],
  idx: number,
  candidate: number,
): boolean => {
  for (const p of PEERS[idx]) {
    if (cells[p].value === candidate) return false;
  }
  return true;
};

/**
 * Set of indices currently in conflict. Computed once per cells change and
 * reused for rendering + solved-detection (plan §7.1) rather than calling
 * cellHasError per cell on every render.
 */
export const getConflicts = (cells: Cell[]): Set<number> => {
  const conflicts = new Set<number>();
  for (let idx = 0; idx < CELL_COUNT; idx++) {
    const value = cells[idx].value;
    if (value === EMPTY) continue;
    for (const p of PEERS[idx]) {
      if (cells[p].value === value) {
        conflicts.add(idx);
        break;
      }
    }
  }
  return conflicts;
};

/** Solved = every cell filled and no conflicts. */
export const isSolved = (cells: Cell[]): boolean => {
  for (let idx = 0; idx < CELL_COUNT; idx++) {
    if (cells[idx].value === EMPTY) return false;
  }
  return getConflicts(cells).size === 0;
};
