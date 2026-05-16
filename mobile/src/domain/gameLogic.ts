/**
 * Pure puzzle mutation logic (no React, no Zustand, no I/O) so it can be unit
 * tested directly. The combined game store wraps these with timer state,
 * persistence, and services. Ports the web app's setCell/undo/redo behaviour
 * to the flat idx-addressed model, using the precomputed PEERS table for the
 * candidate auto-removal instead of the old row/col/block triple loop.
 */
import { Cell, EMPTY, cloneCell, cloneCells, isPrefilled } from './cell';
import type { Action } from './models';
import { PEERS, numberWorksInCell } from './rules';

export interface PuzzleSlice {
  cells: Cell[];
  originalCells: Cell[];
  actions: Action[];
  redoActions: Action[];
}

export interface MutationResult {
  cells: Cell[];
  actions: Action[];
  redoActions: Action[];
  /** Selection to focus after undo/redo (web parity); undefined = unchanged. */
  selectedIdx?: number;
}

const unchanged = (s: PuzzleSlice): MutationResult => ({
  cells: s.cells,
  actions: s.actions,
  redoActions: s.redoActions,
});

/**
 * Place (or toggle off) a value in a cell. When a value is newly placed, the
 * value is removed from the candidates of every peer (row/col/block).
 */
export function applyValue(
  slice: PuzzleSlice,
  idx: number,
  value: number,
): MutationResult {
  if (isPrefilled(slice.originalCells, idx)) return unchanged(slice);

  const cells = cloneCells(slice.cells);
  const actions = slice.actions.slice();
  const prev = slice.cells[idx];

  actions.push({ idx, prevCell: cloneCell(prev), isParent: true });

  const newValue = prev.value === value ? EMPTY : value;
  cells[idx] = { ...cells[idx], value: newValue };

  if (prev.value === EMPTY && newValue !== EMPTY) {
    for (const p of PEERS[idx]) {
      if (cells[p].candidates.includes(newValue)) {
        actions.push({ idx: p, prevCell: cloneCell(cells[p]), isParent: false });
        cells[p] = {
          ...cells[p],
          candidates: cells[p].candidates.filter((c) => c !== newValue),
        };
      }
    }
  }

  return { cells, actions, redoActions: [] };
}

/** Toggle a pencil candidate in an (empty) cell. */
export function applyPencil(
  slice: PuzzleSlice,
  idx: number,
  candidate: number,
): MutationResult {
  if (isPrefilled(slice.originalCells, idx)) return unchanged(slice);

  const cells = cloneCells(slice.cells);
  const actions = slice.actions.slice();
  const target = cells[idx];

  actions.push({ idx, prevCell: cloneCell(slice.cells[idx]), isParent: true });

  const has = target.candidates.includes(candidate);
  cells[idx] = {
    ...target,
    candidates: has
      ? target.candidates.filter((c) => c !== candidate)
      : [...target.candidates, candidate].sort((a, b) => a - b),
  };

  return { cells, actions, redoActions: [] };
}

/** Clear a cell's value and candidates. */
export function eraseCell(slice: PuzzleSlice, idx: number): MutationResult {
  if (isPrefilled(slice.originalCells, idx)) return unchanged(slice);
  const prev = slice.cells[idx];
  if (prev.value === EMPTY && prev.candidates.length === 0) {
    return unchanged(slice);
  }
  const cells = cloneCells(slice.cells);
  const actions = slice.actions.slice();
  actions.push({ idx, prevCell: cloneCell(prev), isParent: true });
  cells[idx] = { ...cells[idx], value: EMPTY, candidates: [] };
  return { cells, actions, redoActions: [] };
}

/** Undo the last parent action and its child actions (web parity). */
export function undo(slice: PuzzleSlice): MutationResult {
  const cells = cloneCells(slice.cells);
  const actions = slice.actions.slice();
  const redoActions = slice.redoActions.slice();
  let selectedIdx: number | undefined;

  let last = actions.pop();
  while (last && !last.isParent) {
    redoActions.push({
      idx: last.idx,
      prevCell: cloneCell(cells[last.idx]),
      isParent: false,
    });
    cells[last.idx] = cloneCell(last.prevCell);
    last = actions.pop();
  }
  if (last) {
    redoActions.push({
      idx: last.idx,
      prevCell: cloneCell(cells[last.idx]),
      isParent: true,
    });
    cells[last.idx] = cloneCell(last.prevCell);
    selectedIdx = last.idx;
  }

  return { cells, actions, redoActions, selectedIdx };
}

/** Redo the last undone parent action and its child actions (web parity). */
export function redo(slice: PuzzleSlice): MutationResult {
  const cells = cloneCells(slice.cells);
  const actions = slice.actions.slice();
  const redoActions = slice.redoActions.slice();
  let selectedIdx: number | undefined;

  let last = redoActions.pop();
  if (last) {
    actions.push({
      idx: last.idx,
      prevCell: cloneCell(cells[last.idx]),
      isParent: true,
    });
    cells[last.idx] = cloneCell(last.prevCell);
    selectedIdx = last.idx;
    last = redoActions.pop();
  }
  while (last && !last.isParent) {
    actions.push({
      idx: last.idx,
      prevCell: cloneCell(cells[last.idx]),
      isParent: false,
    });
    cells[last.idx] = cloneCell(last.prevCell);
    last = redoActions.pop();
  }
  if (last) redoActions.push(last);

  return { cells, actions, redoActions, selectedIdx };
}

/** Reset to the original givens, clearing history. */
export function resetPuzzle(slice: PuzzleSlice): MutationResult {
  return {
    cells: cloneCells(slice.originalCells),
    actions: [],
    redoActions: [],
  };
}

/** Auto-fill all legal candidates into empty cells. */
export function fillCandidates(cells: Cell[]): Cell[] {
  const next = cloneCells(cells);
  for (let idx = 0; idx < next.length; idx++) {
    if (next[idx].value !== EMPTY) continue;
    const cands: number[] = [];
    for (let n = 1; n <= 9; n++) {
      if (numberWorksInCell(next, idx, n)) cands.push(n);
    }
    next[idx] = { ...next[idx], candidates: cands };
  }
  return next;
}

/** Remove all pencil candidates. */
export function clearCandidates(cells: Cell[]): Cell[] {
  return cells.map((c) => ({ ...c, candidates: [] }));
}
