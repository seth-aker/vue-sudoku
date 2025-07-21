// deno-lint-ignore-file no-explicit-any
import { expect, describe, test } from 'vitest'

import { PuzzleSolverImplementation } from "./puzzleSolverImplementation.ts"
import { Row } from "../datasource/models/row.ts"
import { PuzzleSolverError } from '../errors/puzzleSolverError.ts'
import { buildBlankPuzzleRows } from '../utils/buildBlankPuzzleRows.ts'

describe('PuzzleSolverImplementation Tests', () => {
  describe('Constructor Tests', () => {
    test('Constructor throws error when invalid puzzle is used', () => {
      const oneRow = [[{cellId: 'test', value: 1, pencilValues: [] as number[], type: 'blank' }]] as Row[]; 
      const nineRowsNoCells = [[],[],[],[],[],[],[],[],[]] as Row[];
      expect(() => new PuzzleSolverImplementation(oneRow)).toThrow(PuzzleSolverError)
      expect(() => new PuzzleSolverImplementation(nineRowsNoCells)).toThrow(PuzzleSolverError)
    })
    test("Constructor initializes with proper values", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const expectedBlockIndices = [
        {rowIndices: [0,1,2], colIndices: [0,1,2]},
        {rowIndices: [0,1,2], colIndices: [3,4,5]},
        {rowIndices: [0,1,2], colIndices: [6,7,8]},
        {rowIndices: [3,4,5], colIndices: [0,1,2]},
        {rowIndices: [3,4,5], colIndices: [3,4,5]},
        {rowIndices: [3,4,5], colIndices: [6,7,8]},
        {rowIndices: [6,7,8], colIndices: [0,1,2]},
        {rowIndices: [6,7,8], colIndices: [3,4,5]},
        {rowIndices: [6,7,8], colIndices: [6,7,8]}
      ]
      expect((puzzleSolver as any).BLOCK_WIDTH).toBe(3);
      expect((puzzleSolver as any).BLOCK_INDICES).toEqual(expectedBlockIndices);
      expect(puzzleSolver.getPuzzle()).toEqual(puzzleRows)
    })
  })
  describe("fillPuzzlePencilValues() Tests", () => {

    test("fillPuzzlePencilValues fills all pencilValues for all cells", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const filledRows = puzzleSolver.fillPuzzlePencilValues();
      
      const puzzleRows2 = buildBlankPuzzleRows(9)
      puzzleRows2[0][0].value = 1;
      const filledRows2 = puzzleSolver.fillPuzzlePencilValues(puzzleRows2);
      
      for(let i = 0; i < filledRows.length; i++) {
        for(let j = 0; j < filledRows.length; j++) {
          expect(filledRows[i][j].pencilValues).not.toEqual(puzzleRows[i][j])
          expect(filledRows[i][j].pencilValues).toEqual([1,2,3,4,5,6,7,8,9])
        }
      }
      filledRows2[0].forEach((cell) => {
        expect(cell.pencilValues).not.toContain(1)
      })
      filledRows2.forEach((row) => {
        expect(row[0].pencilValues).not.toContain(1)
      })
      puzzleSolver.getBlock(0, filledRows2).forEach((cell) => {
        expect(cell.pencilValues).not.toContain(1)
      })
    })
  })
  describe("findSingle() tests", () => {
    test('findSingle finds last digit single in row when there is one', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRows[0][i].value = i + 1
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzlePencilValues();
      const single = puzzleSolver.findSingle();
      expect(single).toBeDefined();
      expect(single?.value).toBe(9);
      expect(single?.rowIndex).toBe(0);
      expect(single?.colIndex).toBe(8);
    })
    test('findSingle finds last digit single in column when there is one', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRows[i][0].value = i + 1
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzlePencilValues();
      const single = puzzleSolver.findSingle();
      expect(single).toBeDefined();
      expect(single?.value).toBe(9);
      expect(single?.rowIndex).toBe(8);
      expect(single?.colIndex).toBe(0);
    })
    test('findSingle finds last digit single in block when there is one', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[0][0].value = 1
      puzzleRows[0][1].value = 2
      puzzleRows[0][2].value = 3
      puzzleRows[1][0].value = 4
      puzzleRows[1][1].value = 5
      puzzleRows[1][2].value = 6
      puzzleRows[2][0].value = 7
      puzzleRows[2][1].value = 8
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzlePencilValues()
      const single = puzzleSolver.findSingle();
      expect(single).toBeDefined();
      expect(single?.value).toBe(9);
      expect(single?.colIndex).toBe(2);
      expect(single?.rowIndex).toBe(2);
    })
    test('findSingle returns undefined when there is no single to be found', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzlePencilValues();
      const single = puzzleSolver.findSingle();
      expect(single).toBeUndefined();
    })
    test('findSingle return hidden single at [8][8] when there is one', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[6][0].value = 9;
      puzzleRows[7][3].value = 9;
      puzzleRows[0][6].value = 9;
      puzzleRows[3][7].value = 9;
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzlePencilValues();
      const single = puzzleSolver.findSingle();
      expect(puzzleSolver.getPuzzle()[8][8].pencilValues).toEqual([1,2,3,4,5,6,7,8,9]);
      expect(single).not.toBeUndefined();
      expect(single?.value).toBe(9);
      expect(single?.rowIndex).toBe(8);
      expect(single?.colIndex).toBe(8);
    })
  })
})
