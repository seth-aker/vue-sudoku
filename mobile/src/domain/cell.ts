/**
 * Core cell model and coordinate helpers.
 *
 * The puzzle is a flat array of 81 cells (no `Cell[][]`, no `SudokuPuzzle`
 * class). A cell is addressed directly by `idx` (0..80); there is intentionally
 * no `getCellAt(x, y)` helper — use `cells[idxOf(x, y)]`.
 *
 * `value === 0` means an empty cell (matches the backend wire format where the
 * cells string uses `'0'` for empties). The old `cellId` and `type`
 * (`prefilled | edited | blank`) fields are removed; prefilled/edited/blank is
 * derived by comparing against the original cells (see isPrefilled / cellState).
 */

export const GRID_SIZE = 9;
export const BLOCK_SIZE = 3;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE; // 81
export const EMPTY = 0;

export interface Cell {
  /** 0 = empty, otherwise 1..9. */
  value: number;
  /** Position in the flat array, 0..80. */
  idx: number;
  /** Pencil-mark candidates, values 1..9. */
  candidates: number[];
}

export const xOf = (idx: number): number => idx % GRID_SIZE;
export const yOf = (idx: number): number => Math.floor(idx / GRID_SIZE);
export const idxOf = (x: number, y: number): number => y * GRID_SIZE + x;

/** Block number 0..8, row-major (0 = top-left, 8 = bottom-right). */
export const blockOf = (idx: number): number => {
  const bx = Math.floor(xOf(idx) / BLOCK_SIZE);
  const by = Math.floor(yOf(idx) / BLOCK_SIZE);
  return by * BLOCK_SIZE + bx;
};

export const createCell = (
  idx: number,
  value: number = EMPTY,
  candidates: number[] = [],
): Cell => ({ idx, value, candidates });

/** Deep copy of a single cell (candidates array is cloned). */
export const cloneCell = (c: Cell): Cell => ({
  idx: c.idx,
  value: c.value,
  candidates: c.candidates.slice(),
});

/** Deep copy of a cells array. */
export const cloneCells = (cells: Cell[]): Cell[] => cells.map(cloneCell);

/** A fresh, fully empty 81-cell array. */
export const createBlankCells = (): Cell[] =>
  Array.from({ length: CELL_COUNT }, (_, idx) => createCell(idx));

/**
 * Deterministic non-solution fixture used by tests/placeholders:
 * value = ((x + y) % 9) + 1. Mirrors the web app's buildStandardPuzzleRows.
 */
export const buildStandardCells = (): Cell[] =>
  Array.from({ length: CELL_COUNT }, (_, idx) =>
    createCell(idx, ((xOf(idx) + yOf(idx)) % GRID_SIZE) + 1),
  );

/** A cell is prefilled if the original puzzle had a value at that idx. */
export const isPrefilled = (original: Cell[], idx: number): boolean =>
  original[idx]?.value !== EMPTY;

export type CellState = 'prefilled' | 'edited' | 'blank';

/** Derived render/lock state — replaces the removed `type` field. */
export const cellState = (
  cells: Cell[],
  original: Cell[],
  idx: number,
): CellState => {
  if (isPrefilled(original, idx)) return 'prefilled';
  return cells[idx]?.value !== EMPTY ? 'edited' : 'blank';
};
