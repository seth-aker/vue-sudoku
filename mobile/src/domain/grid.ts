/**
 * Read helpers over the flat 81-cell array. These replace the old
 * SudokuPuzzle.getRow/getColumn/getBlock class methods. Block numbering matches
 * the web app (row-major, 0 = top-left .. 8 = bottom-right).
 */
import { BLOCK_SIZE, Cell, GRID_SIZE, idxOf } from './cell';

export const getRow = (cells: Cell[], rowIndex: number): Cell[] => {
  const row: Cell[] = new Array(GRID_SIZE);
  for (let x = 0; x < GRID_SIZE; x++) row[x] = cells[idxOf(x, rowIndex)];
  return row;
};

export const getColumn = (cells: Cell[], colIndex: number): Cell[] => {
  const col: Cell[] = new Array(GRID_SIZE);
  for (let y = 0; y < GRID_SIZE; y++) col[y] = cells[idxOf(colIndex, y)];
  return col;
};

export const getBlock = (cells: Cell[], blockNum: number): Cell[] => {
  const blockRow = Math.floor(blockNum / BLOCK_SIZE);
  const blockCol = blockNum % BLOCK_SIZE;
  const startY = blockRow * BLOCK_SIZE;
  const startX = blockCol * BLOCK_SIZE;
  const block: Cell[] = new Array(GRID_SIZE);
  for (let i = 0; i < GRID_SIZE; i++) {
    const x = startX + (i % BLOCK_SIZE);
    const y = startY + Math.floor(i / BLOCK_SIZE);
    block[i] = cells[idxOf(x, y)];
  }
  return block;
};
