import { beforeEach, describe, expect, it } from 'vitest';

import { Cell, createBlankCells, idxOf } from './cell';
import {
  PuzzleSlice,
  applyPencil,
  applyValue,
  clearCandidates,
  eraseCell,
  fillCandidates,
  redo,
  resetPuzzle,
  undo,
} from './gameLogic';

const slice = (cells: Cell[], original?: Cell[]): PuzzleSlice => ({
  cells,
  originalCells: original ?? createBlankCells(),
  actions: [],
  redoActions: [],
});

describe('applyValue', () => {
  it('places a value and records a parent action', () => {
    const r = applyValue(slice(createBlankCells()), idxOf(0, 0), 5);
    expect(r.cells[idxOf(0, 0)].value).toBe(5);
    expect(r.actions).toHaveLength(1);
    expect(r.actions[0]).toMatchObject({ idx: 0, isParent: true });
    expect(r.redoActions).toEqual([]);
  });

  it('toggles the value off when re-entered', () => {
    const s = slice(createBlankCells());
    const once = applyValue(s, 0, 5);
    const twice = applyValue({ ...s, cells: once.cells }, 0, 5);
    expect(twice.cells[0].value).toBe(0);
  });

  it('removes the value from peer candidates and logs child actions', () => {
    const cells = createBlankCells();
    cells[idxOf(1, 0)].candidates = [5, 7]; // row peer
    cells[idxOf(0, 1)].candidates = [5]; // column peer
    cells[idxOf(8, 8)].candidates = [5]; // non-peer, untouched
    const r = applyValue(slice(cells), idxOf(0, 0), 5);
    expect(r.cells[idxOf(1, 0)].candidates).toEqual([7]);
    expect(r.cells[idxOf(0, 1)].candidates).toEqual([]);
    expect(r.cells[idxOf(8, 8)].candidates).toEqual([5]);
    expect(r.actions[0].isParent).toBe(true);
    expect(r.actions.slice(1).every((a) => !a.isParent)).toBe(true);
  });

  it('does not edit prefilled cells', () => {
    const original = createBlankCells();
    original[0].value = 9;
    const r = applyValue(slice(createBlankCells(), original), 0, 1);
    expect(r.cells[0].value).toBe(0);
    expect(r.actions).toHaveLength(0);
  });
});

describe('applyPencil', () => {
  it('toggles candidates sorted, without touching peers', () => {
    const s = slice(createBlankCells());
    const a = applyPencil(s, 0, 3);
    const b = applyPencil({ ...s, cells: a.cells }, 0, 1);
    expect(b.cells[0].candidates).toEqual([1, 3]);
    const c = applyPencil({ ...s, cells: b.cells }, 0, 3);
    expect(c.cells[0].candidates).toEqual([1]);
  });
});

describe('eraseCell', () => {
  it('clears value and candidates', () => {
    const cells = createBlankCells();
    cells[0].value = 4;
    cells[0].candidates = [1, 2];
    const r = eraseCell(slice(cells), 0);
    expect(r.cells[0]).toMatchObject({ value: 0, candidates: [] });
  });
});

describe('undo / redo (parent + children round-trip)', () => {
  let base: PuzzleSlice;
  beforeEach(() => {
    const cells = createBlankCells();
    cells[idxOf(1, 0)].candidates = [5];
    cells[idxOf(0, 1)].candidates = [5];
    base = slice(cells);
  });

  it('undo restores cells and peer candidates; redo re-applies', () => {
    const placed = applyValue(base, idxOf(0, 0), 5);
    const afterPlace: PuzzleSlice = { ...base, ...placed };

    const undone = undo(afterPlace);
    expect(undone.cells[idxOf(0, 0)].value).toBe(0);
    expect(undone.cells[idxOf(1, 0)].candidates).toEqual([5]);
    expect(undone.cells[idxOf(0, 1)].candidates).toEqual([5]);
    expect(undone.selectedIdx).toBe(idxOf(0, 0));
    expect(undone.actions).toEqual([]);

    const redone = redo({ ...base, ...undone });
    expect(redone.cells[idxOf(0, 0)].value).toBe(5);
    expect(redone.cells[idxOf(1, 0)].candidates).toEqual([]);
    expect(redone.cells[idxOf(0, 1)].candidates).toEqual([]);
  });
});

describe('resetPuzzle / candidates', () => {
  it('reset returns to originals and clears history', () => {
    const original = createBlankCells();
    original[0].value = 7;
    const cells = createBlankCells();
    cells[0].value = 7;
    cells[1].value = 3;
    const r = resetPuzzle({
      cells,
      originalCells: original,
      actions: [{ idx: 1, prevCell: cells[1], isParent: true }],
      redoActions: [],
    });
    expect(r.cells[1].value).toBe(0);
    expect(r.cells[0].value).toBe(7);
    expect(r.actions).toEqual([]);
  });

  it('fillCandidates only fills legal numbers in empty cells', () => {
    const cells = createBlankCells();
    cells[idxOf(0, 0)].value = 5;
    const filled = fillCandidates(cells);
    expect(filled[idxOf(0, 0)].candidates).toEqual([]); // has a value
    expect(filled[idxOf(1, 0)].candidates).not.toContain(5); // peer of the 5
    expect(filled[idxOf(8, 8)].candidates).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(clearCandidates(filled).every((c) => c.candidates.length === 0)).toBe(
      true,
    );
  });
});
