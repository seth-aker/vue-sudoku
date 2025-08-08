import {describe, it, expect, beforeEach} from 'vitest'
import { SudokuPuzzle } from './puzzle'
import { buildStandardPuzzleRows } from '@/utils/buildPuzzle'
import type { Cell } from './cell'
import type { Row } from './row'

describe('SudokuPuzzle Tests', () => {
  let puzzleRows: Row[];
  beforeEach(() => {
    puzzleRows = buildStandardPuzzleRows().map((row) => row.map((cell) => ({...cell, cellId: 'testCellId'})))
  })
  it('puzzle is created with correct fields and default difficulty', () => {
    const puzzle = new SudokuPuzzle(puzzleRows);
    expect(puzzle.cellsPerRow).toBe(9)
    expect(puzzle.rows).toEqual(puzzleRows)
    expect(puzzle.originalPuzzle).toEqual(puzzleRows)
    expect(puzzle.options).toBe('medium');
  })

  it('puzzle with invalid row length throws error', () => {
    puzzleRows.pop();
    expect(() => (new SudokuPuzzle(puzzleRows))).toThrow('Row length of 8 is invalid for proper sudoku puzzles.')
  })

  it('puzzle.getBlock() returns correct block information and format', () => {
    const puzzle = new SudokuPuzzle(puzzleRows);
    const expectedCellOrderBlock0 = [1,2,3,2,3,4,3,4,5]
    const expectedCellOrderBlock4 = [7,8,9,8,9,1,9,1,2]
    const expectedCellOrderBlock8 = [4,5,6,5,6,7,6,7,8]
    const expectedBlock0 = buildTestCellArray(expectedCellOrderBlock0);
    const expectedBlock4 = buildTestCellArray(expectedCellOrderBlock4);
    const expectedBlock8 = buildTestCellArray(expectedCellOrderBlock8)
    expect(puzzle.getBlock(0)).toEqual(expectedBlock0)
    expect(puzzle.getBlock(4)).toEqual(expectedBlock4)
    expect(puzzle.getBlock(8)).toEqual(expectedBlock8)
  })
  it('puzzle.getBlock() returns undefined for arg out of range of puzzle', () => {
    const puzzle = new SudokuPuzzle(puzzleRows);

    expect(puzzle.getBlock(10)).toBeUndefined();
    expect(puzzle.getBlock(-1)).toBeUndefined();
  })

  it('puzzle.getColumn() returns correct column and format', () => {
    const puzzle = new SudokuPuzzle(puzzleRows);

    for(let i = 0; i < 9; i++) {
      let expectedColumn: Cell[] = []
      for(let j = 0; j < 9; j++) {
        expectedColumn.push({cellId: `testCellId` ,type: 'prefilled', value: ((i + j) % 9) + 1, candidates: []})
      }
      expect(puzzle.getColumn(i)).toEqual(expectedColumn)
    }
  })
  it('puzzle.getColumn() returns undefined for args out of range of puzzle', () => {
    const puzzle = new SudokuPuzzle(puzzleRows);
    expect(puzzle.getColumn(10)).toBeUndefined();
    expect(puzzle.getColumn(-1)).toBeUndefined();
  })
})

const buildTestCellArray = (numOrder: number[]) => {
  const block: Cell[] = numOrder.map((num) => ({cellId: `testCellId` ,type: 'prefilled', value: num, pencilValues: []}));
  return block;
}
