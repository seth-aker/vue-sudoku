import { describe, expect, it } from 'vitest';

import { createCell } from './cell';
import type { Action } from './models';
import {
  buildCells,
  candidatesToString,
  cellsToString,
  deserializeAction,
  deserializeCell,
  serializeAction,
  serializeCell,
} from './serialization';

const SOLVED =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

describe('string (de)serialization', () => {
  it('cells round-trip through the 81-char string', () => {
    const cells = buildCells(SOLVED);
    expect(cells).toHaveLength(81);
    expect(cellsToString(cells)).toBe(SOLVED);
  });

  it('current values override originals; empties are 0', () => {
    const current = '0' + SOLVED.slice(1);
    const cells = buildCells(SOLVED, current);
    expect(cells[0].value).toBe(0);
    expect(cellsToString(cells)).toBe(current);
  });

  it('candidates round-trip via the ":"-separated format', () => {
    const cells = buildCells(SOLVED.replace(/./g, '0'));
    cells[0].candidates = [1, 2, 3];
    cells[80].candidates = [9];
    const str = candidatesToString(cells);
    const rebuilt = buildCells(
      SOLVED.replace(/./g, '0'),
      undefined,
      str,
    );
    expect(rebuilt[0].candidates).toEqual([1, 2, 3]);
    expect(rebuilt[80].candidates).toEqual([9]);
    expect(rebuilt[40].candidates).toEqual([]);
  });
});

describe('bitmask (de)serialization (no type bits)', () => {
  it('round-trips idx, value and candidates', () => {
    const cell = createCell(80, 5, [1, 9]);
    const packed = serializeCell(cell);
    expect(deserializeCell(packed)).toEqual(cell);
  });

  it('does not use any bits at/above the parent bit (20) for a cell', () => {
    const packed = serializeCell(createCell(80, 9, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
    // bits 20+ must be clear — proves the old type bits (20-21) are gone.
    expect(packed >> 20).toBe(0);
  });

  it('actions round-trip with the isParent flag at bit 20', () => {
    const parent: Action = {
      idx: 12,
      prevCell: createCell(12, 4, [2, 6]),
      isParent: true,
    };
    const child: Action = {
      idx: 12,
      prevCell: createCell(12, 0, []),
      isParent: false,
    };
    expect(deserializeAction(serializeAction(parent))).toEqual(parent);
    expect(deserializeAction(serializeAction(child))).toEqual(child);
    expect((serializeAction(parent) >> 20) & 1).toBe(1);
    expect((serializeAction(child) >> 20) & 1).toBe(0);
  });
});
