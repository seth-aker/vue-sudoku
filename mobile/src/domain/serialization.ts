/**
 * Wire (de)serialization, rewritten for the flat idx-addressed model.
 *
 * Changes vs. the web app:
 *  - Cells are idx-addressed; no `cellId` parsing.
 *  - The cell bitmask NO LONGER encodes `type` (the old 2 type bits are gone).
 *    Layout is now: bits 0-6 = idx, bits 7-10 = value, bits 11-19 = candidate
 *    mask. The action `isParent` flag moves down to bit 20.
 *  - Empty cells use value 0 (not undefined).
 *
 * String formats are unchanged and remain backend-compatible:
 *  - cells:      81 chars, one digit per cell ('0' = empty), idx order.
 *  - candidates: per-cell digits joined, cells separated by ':'.
 */
import { CELL_COUNT, Cell, EMPTY, createBlankCells } from './cell';
import type { Action } from './models';

const VALUE_SHIFT = 7;
const CANDIDATE_SHIFT = 11;
const PARENT_SHIFT = 20;
const IDX_MASK = 0x7f; // 7 bits (0..80)
const VALUE_MASK = 0xf; // 4 bits (0..9)
const CANDIDATE_MASK = 0x1ff; // 9 bits (candidates 1..9)

const safeDigit = (ch: string): number => {
  const n = Number.parseInt(ch, 10);
  return Number.isNaN(n) ? EMPTY : n;
};

/** 81-char cells string, idx order, '0' for empty. */
export const cellsToString = (cells: Cell[]): string =>
  cells.map((c) => String(c.value)).join('');

/** Per-cell candidate digits joined, cells separated by ':'. */
export const candidatesToString = (cells: Cell[]): string =>
  cells.map((c) => c.candidates.join('')).join(':');

/**
 * Build a flat 81-cell array from wire strings.
 * - originalCellsStr: required; defines the puzzle givens.
 * - currentCellsStr: optional; the player's current values (defaults to givens).
 * - candidatesStr: optional; ':'-separated per-cell candidate digits.
 */
export const buildCells = (
  originalCellsStr: string,
  currentCellsStr?: string,
  candidatesStr?: string,
): Cell[] => {
  const original = originalCellsStr.split('').map(safeDigit);
  const current = currentCellsStr?.split('').map(safeDigit);
  const candidates = candidatesStr
    ?.split(':')
    .map((group) => group.split('').map(safeDigit).filter((d) => d !== EMPTY));

  const cells = createBlankCells();
  for (let idx = 0; idx < CELL_COUNT; idx++) {
    const originalVal = original[idx] ?? EMPTY;
    const currentVal = current ? (current[idx] ?? EMPTY) : originalVal;
    cells[idx].value = currentVal;
    cells[idx].candidates = candidates ? (candidates[idx] ?? []) : [];
  }
  return cells;
};

const candidatesToMask = (candidates: number[]): number =>
  candidates.reduce((mask, c) => mask | (1 << (c - 1)), 0);

const maskToCandidates = (mask: number): number[] => {
  const out: number[] = [];
  for (let bit = 0; bit < 9; bit++) {
    if (mask & (1 << bit)) out.push(bit + 1);
  }
  return out;
};

/** Pack a cell into a single integer (no type bits). */
export const serializeCell = (cell: Cell): number =>
  (candidatesToMask(cell.candidates) << CANDIDATE_SHIFT) |
  ((cell.value & VALUE_MASK) << VALUE_SHIFT) |
  (cell.idx & IDX_MASK);

export const deserializeCell = (num: number): Cell => ({
  idx: num & IDX_MASK,
  value: (num >> VALUE_SHIFT) & VALUE_MASK,
  candidates: maskToCandidates((num >> CANDIDATE_SHIFT) & CANDIDATE_MASK),
});

export const serializeAction = (action: Action): number =>
  ((action.isParent ? 1 : 0) << PARENT_SHIFT) | serializeCell(action.prevCell);

export const deserializeAction = (num: number): Action => {
  const prevCell = deserializeCell(num);
  return {
    idx: prevCell.idx,
    prevCell,
    isParent: ((num >> PARENT_SHIFT) & 1) === 1,
  };
};
