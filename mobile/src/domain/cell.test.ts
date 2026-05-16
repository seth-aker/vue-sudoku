import { describe, expect, it } from 'vitest';

import {
  CELL_COUNT,
  blockOf,
  buildStandardCells,
  cellState,
  createBlankCells,
  idxOf,
  isPrefilled,
  xOf,
  yOf,
} from './cell';

describe('coordinate helpers', () => {
  it('round-trips idx <-> (x, y)', () => {
    for (let idx = 0; idx < CELL_COUNT; idx++) {
      expect(idxOf(xOf(idx), yOf(idx))).toBe(idx);
    }
  });

  it('computes block numbers row-major (0=top-left, 8=bottom-right)', () => {
    expect(blockOf(idxOf(0, 0))).toBe(0);
    expect(blockOf(idxOf(8, 0))).toBe(2);
    expect(blockOf(idxOf(4, 4))).toBe(4); // center
    expect(blockOf(idxOf(0, 3))).toBe(3); // middle-left
    expect(blockOf(idxOf(8, 8))).toBe(8);
  });
});

describe('cell builders', () => {
  it('createBlankCells yields 81 empty, idx-tagged cells', () => {
    const cells = createBlankCells();
    expect(cells).toHaveLength(81);
    cells.forEach((c, i) => {
      expect(c.idx).toBe(i);
      expect(c.value).toBe(0);
      expect(c.candidates).toEqual([]);
    });
  });

  it('buildStandardCells uses ((x+y)%9)+1', () => {
    const cells = buildStandardCells();
    expect(cells[idxOf(0, 0)].value).toBe(1);
    expect(cells[idxOf(8, 8)].value).toBe(((8 + 8) % 9) + 1);
  });
});

describe('derived cell state (replaces removed `type`)', () => {
  const original = buildStandardCells().map((c) =>
    c.idx % 2 === 0 ? { ...c } : { ...c, value: 0 },
  );

  it('isPrefilled reflects the original givens', () => {
    expect(isPrefilled(original, 0)).toBe(true);
    expect(isPrefilled(original, 1)).toBe(false);
  });

  it('cellState derives prefilled/edited/blank', () => {
    const cells = original.map((c) => ({ ...c }));
    expect(cellState(cells, original, 0)).toBe('prefilled');
    expect(cellState(cells, original, 1)).toBe('blank');
    cells[1].value = 7;
    expect(cellState(cells, original, 1)).toBe('edited');
  });
});
