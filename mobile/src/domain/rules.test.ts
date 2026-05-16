import { describe, expect, it } from 'vitest';

import { CELL_COUNT, blockOf, createBlankCells, idxOf, xOf, yOf } from './cell';
import {
  PEERS,
  cellHasError,
  getConflicts,
  isSolved,
  numberWorksInCell,
} from './rules';
import { buildCells } from './serialization';

// Canonical valid solved grid.
const SOLVED =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

describe('PEERS table', () => {
  it('every cell has exactly 20 peers', () => {
    for (let idx = 0; idx < CELL_COUNT; idx++) {
      expect(PEERS[idx]).toHaveLength(20);
    }
  });

  it('peers share row, column, or block and exclude self', () => {
    const idx = idxOf(4, 4);
    for (const p of PEERS[idx]) {
      expect(p).not.toBe(idx);
      const shares =
        xOf(p) === xOf(idx) || yOf(p) === yOf(idx) || blockOf(p) === blockOf(idx);
      expect(shares).toBe(true);
    }
  });
});

describe('conflict detection', () => {
  it('a solved grid has no conflicts and is solved', () => {
    const cells = buildCells(SOLVED);
    expect(getConflicts(cells).size).toBe(0);
    expect(isSolved(cells)).toBe(true);
  });

  it('flags both cells of a duplicate in a unit', () => {
    const cells = createBlankCells();
    cells[idxOf(0, 0)].value = 5;
    cells[idxOf(1, 0)].value = 5; // same row
    expect(cellHasError(cells, idxOf(0, 0))).toBe(true);
    expect(cellHasError(cells, idxOf(1, 0))).toBe(true);
    const conflicts = getConflicts(cells);
    expect(conflicts.has(idxOf(0, 0))).toBe(true);
    expect(conflicts.has(idxOf(1, 0))).toBe(true);
  });

  it('empty cells never conflict; an unfinished grid is not solved', () => {
    const cells = buildCells(SOLVED);
    cells[idxOf(0, 0)].value = 0;
    expect(cellHasError(cells, idxOf(0, 0))).toBe(false);
    expect(isSolved(cells)).toBe(false);
  });

  it('numberWorksInCell respects row/col/block peers', () => {
    const cells = createBlankCells();
    cells[idxOf(3, 0)].value = 9; // same row
    cells[idxOf(0, 5)].value = 7; // same column
    const target = idxOf(0, 0);
    expect(numberWorksInCell(cells, target, 9)).toBe(false);
    expect(numberWorksInCell(cells, target, 7)).toBe(false);
    expect(numberWorksInCell(cells, target, 4)).toBe(true);
  });
});
