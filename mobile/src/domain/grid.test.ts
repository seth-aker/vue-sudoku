import { describe, expect, it } from 'vitest';

import { buildStandardCells, idxOf } from './cell';
import { getBlock, getColumn, getRow } from './grid';

const values = (cells: { value: number }[]) => cells.map((c) => c.value);

describe('grid read helpers', () => {
  const cells = buildStandardCells(); // value = ((x + y) % 9) + 1

  it('getRow returns the 9 cells of a row in x order', () => {
    expect(values(getRow(cells, 0))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(getRow(cells, 5)[3]).toBe(cells[idxOf(3, 5)]);
  });

  it('getColumn returns the 9 cells of a column in y order', () => {
    expect(values(getColumn(cells, 0))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(getColumn(cells, 8)[2]).toBe(cells[idxOf(8, 2)]);
  });

  it('getBlock returns blocks row-major, matching the web app ordering', () => {
    expect(values(getBlock(cells, 0))).toEqual([1, 2, 3, 2, 3, 4, 3, 4, 5]);
    expect(values(getBlock(cells, 4))).toEqual([7, 8, 9, 8, 9, 1, 9, 1, 2]);
    expect(values(getBlock(cells, 8))).toEqual([4, 5, 6, 5, 6, 7, 6, 7, 8]);
  });
});
