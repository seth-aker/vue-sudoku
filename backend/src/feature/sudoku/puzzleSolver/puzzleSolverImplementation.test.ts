import { expect, describe, test } from 'vitest'

import { PuzzleSolverImplementation } from './puzzleSolverImplementation'
import { Row } from '../datasource/models/row'
import { PuzzleSolverError } from '../errors/puzzleSolverError'
import { buildBlankPuzzleRows } from '../utils/buildBlankPuzzleRows'

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
    test('findSingle finds single when there is one', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      
    })
  })
})
