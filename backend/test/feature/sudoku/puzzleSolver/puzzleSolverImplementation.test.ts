// deno-lint-ignore-file no-explicit-any
import { expect, describe, test } from 'vitest'

import { PuzzleSolverImplementation } from "@/feature/sudoku/puzzleSolver/puzzleSolverImplementation"
import { Row } from "@/feature/sudoku/datasource/models/row"
import { PuzzleSolverError } from '@/feature/sudoku/errors/puzzleSolverError'
import { buildBlankPuzzleRows } from '@/feature/sudoku/utils/buildBlankPuzzleRows'

describe('PuzzleSolverImplementation Tests', () => {
  describe('Constructor Tests', () => {
    test('Constructor throws error when invalid puzzle is used', () => {
      const oneRow = [[{cellId: 'test', value: 1, candidates: new Set<number>(), type: 'blank' }]] as Row[]; 
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
      const filledRows = puzzleSolver.fillPuzzleCandidates();
      
      const puzzleRows2 = buildBlankPuzzleRows(9)
      puzzleRows2[0][0].value = 1;
      const filledRows2 = puzzleSolver.fillPuzzleCandidates(puzzleRows2);
      
      for(let i = 0; i < filledRows.length; i++) {
        for(let j = 0; j < filledRows.length; j++) {
          expect(filledRows[i][j].candidates).not.toEqual(puzzleRows[i][j])
          expect(filledRows[i][j].candidates).toEqual(new Set([1,2,3,4,5,6,7,8,9]))
        }
      }
      filledRows2[0].forEach((cell) => {
        expect(cell.candidates).not.toContain(1)
      })
      filledRows2.forEach((row) => {
        expect(row[0].candidates).not.toContain(1)
      })
      puzzleSolver.getBlock(0, filledRows2).forEach((cell) => {
        expect(cell.candidates).not.toContain(1)
      })
    })
  })
  describe("fillCellPencilValues() Tests", () => {
    test('fillCellPencilValues fills all cells when no numbers conflict', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillCellCandidates(0, 0);
      expect(puzzleSolver.getPuzzle()[0][0].candidates).toEqual(new Set([1,2,3,4,5,6,7,8,9]))
    })
    test('fillCellPencilValues only fills one number for cell that has one option in row', () => {
      const puzzleRows1 = buildBlankPuzzleRows(9);
      for(let i = 1; i < 9; i++) {
        puzzleRows1[0][i].value = i
      }
      const puzzleRows2 = buildBlankPuzzleRows(9);
      for(let i = 1; i < 9; i++) {
        puzzleRows2[i][0].value = i
      }
      const puzzleRows3 = buildBlankPuzzleRows(9);
      puzzleRows3[0][1].value = 1;
      puzzleRows3[0][2].value = 2;
      puzzleRows3[1][0].value = 3;
      puzzleRows3[1][1].value = 4;
      puzzleRows3[1][2].value = 5;
      puzzleRows3[2][0].value = 6;
      puzzleRows3[2][1].value = 7;
      puzzleRows3[2][2].value = 8;

      const puzzleSolver1 = new PuzzleSolverImplementation(puzzleRows1);
      const puzzleSolver2 = new PuzzleSolverImplementation(puzzleRows2);
      const puzzleSolver3 = new PuzzleSolverImplementation(puzzleRows3)
      puzzleSolver1.fillCellCandidates(0,0);
      puzzleSolver2.fillCellCandidates(0,0);
      puzzleSolver3.fillCellCandidates(0,0);
      expect(puzzleSolver1.getPuzzle()[0][0].candidates).toEqual(new Set([9]))
      expect(puzzleSolver2.getPuzzle()[0][0].candidates).toEqual(new Set([9]))
      expect(puzzleSolver3.getPuzzle()[0][0].candidates).toEqual(new Set([9]))
    })
    test('fillCellPencilValues doesn\'t duplicate pencil values', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[0][0].candidates = new Set<number>([1,2,3,4,5,6,7,8,9])
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillCellCandidates(0,0);
      expect(puzzleSolver.getPuzzle()[0][0].candidates).toEqual(new Set([1,2,3,4,5,6,7,8,9]))
    })
  })
  describe("findFullHouse() tests", () => {
    test("findFullHouseRow() returns undefined when there is not a fullhouse in the puzzle", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      for(let i = 0; i < puzzleRows.length; i++) {
        expect((puzzleSolver as any).findFullHouseRow(i)).toBeUndefined();
      }
    })
    test("findFullHouseRow() return correct values when a full house row exists", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRows[0][i].value = i + 1
        puzzleRows[8][i].value = i + 1
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = (puzzleSolver as any).findFullHouseRow(0);
      const res2 = (puzzleSolver as any).findFullHouseRow(8);
      expect(res.colIndex).toBe(8)
      expect(res.value).toBe(9)
      expect(res2.colIndex).toBe(8)
      expect(res2.value).toBe(9)
    })
    test("findFullHouseCol() returns undefined when there is not a fullhouse in the puzzle", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      for(let i = 0; i < puzzleRows.length; i++) {
        expect((puzzleSolver as any).findFullHouseCol(i)).toBeUndefined();
      }
    })
    test("findFullHouseCol() return correct values when a full house col exists", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRows[i][0].value = i + 1
        puzzleRows[i][8].value = i + 1
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = (puzzleSolver as any).findFullHouseCol(0);
      const res2 = (puzzleSolver as any).findFullHouseCol(8);
      expect(res.rowIndex).toBe(8)
      expect(res.value).toBe(9)
      expect(res2.rowIndex).toBe(8)
      expect(res2.value).toBe(9)
    })
    test("findFullHouseBlock() returns undefined when there is not a fullhouse in the puzzle", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      for(let i = 0; i < puzzleRows.length; i++) {
        expect((puzzleSolver as any).findFullHouseBlock(i)).toBeUndefined();
      }
    })
    test("findFullHouseBlock() return correct values when a full house block exists", () => {
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
      const res = (puzzleSolver as any).findFullHouseBlock(0);
      expect(res.rowIndex).toBe(2);
      expect(res.colIndex).toBe(2);
      expect(res.value).toBe(9)
    })
    test("findFullHouse() returns values for full houses", () => {
      const puzzleRowsRow = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRowsRow[8][i].value = i + 1
      }
      const puzzleRowsCol = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRowsCol[i][8].value = i + 1
      } 
      const puzzleRowsBlock = buildBlankPuzzleRows(9);
      puzzleRowsBlock[0][0].value = 1
      puzzleRowsBlock[0][1].value = 2
      puzzleRowsBlock[0][2].value = 3
      puzzleRowsBlock[1][0].value = 4
      puzzleRowsBlock[1][1].value = 5
      puzzleRowsBlock[1][2].value = 6
      puzzleRowsBlock[2][0].value = 7
      puzzleRowsBlock[2][1].value = 8

      const puzzleSolver = new PuzzleSolverImplementation(puzzleRowsRow)
      const rowRes = (puzzleSolver as any).findFullHouse()
      const colRes = (puzzleSolver as any).findFullHouse(puzzleRowsCol);
      const blockRes = (puzzleSolver as any).findFullHouse(puzzleRowsBlock);
      expect(rowRes.rowIndex).toBe(8);
      expect(rowRes.colIndex).toBe(8);
      expect(rowRes.value).toBe(9);
      expect(colRes.rowIndex).toBe(8);
      expect(colRes.colIndex).toBe(8);
      expect(colRes.value).toBe(9);
      expect(blockRes.rowIndex).toBe(2);
      expect(blockRes.colIndex).toBe(2);
      expect(blockRes.value).toBe(9)
    })
  })
  describe("findSingle() tests", () => {
    test('findSingle finds last digit single in row when there is one', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < 8; i++) {
        puzzleRows[0][i].value = i + 1
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
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
      puzzleSolver.fillPuzzleCandidates();
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
      puzzleSolver.fillPuzzleCandidates()
      const single = puzzleSolver.findSingle();
      expect(single).toBeDefined();
      expect(single?.value).toBe(9);
      expect(single?.colIndex).toBe(2);
      expect(single?.rowIndex).toBe(2);
    })
    test('findSingle returns undefined when there is no single to be found', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
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
      puzzleSolver.fillPuzzleCandidates();
      const single = puzzleSolver.findSingle();
      expect(puzzleSolver.getPuzzle()[8][8].candidates).toEqual(new Set([1,2,3,4,5,6,7,8,9]));
      expect(single).not.toBeUndefined();
      expect(single?.value).toBe(9);
      expect(single?.rowIndex).toBe(8);
      expect(single?.colIndex).toBe(8);
    })
  })
  describe('findLockedPencilValue() Tests', () => {
    test('findLockedPencilValue returns locked value in row type 1', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      // Use a configuration that only allows one locked pencil value.
      puzzleRows[1][0].value = 2;
      puzzleRows[1][1].value = 3;
      puzzleRows[1][2].value = 4;
      puzzleRows[2][0].value = 5;
      puzzleRows[2][1].value = 6;
      puzzleRows[3][2].value = 7;
      puzzleRows[2][6].value = 1;
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
      const lockedValue = (puzzleSolver as any).findLockedPencilValueInRowsType1(0);
      expect(lockedValue).toBeDefined();
      expect(lockedValue?.value).toBe(1);
      expect(lockedValue?.rowIndex).toBe(0);
      expect(lockedValue?.colIndex).toBe(undefined)
    })
    test('findLockedPencilValue returns locked value in col type 1', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      // Use a configuration that only allows one locked pencil value.
      puzzleRows[1][0].value = 2;
      puzzleRows[1][1].value = 3;
      puzzleRows[1][2].value = 4;
      puzzleRows[2][0].value = 5;
      puzzleRows[2][1].value = 6;
      puzzleRows[0][1].value = 7;
      puzzleRows[3][0].value = 1;
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
      const lockedValue = (puzzleSolver as any).findLockedPencilValueInColsType1(0);
      expect(lockedValue).toBeDefined();
      expect(lockedValue?.value).toBe(1);
      expect(lockedValue?.rowIndex).toBe(undefined);
      expect(lockedValue?.colIndex).toBe(2)
    })
    test('findLockedPencilValue returns locked value in row type 2', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[0][3].value = 2;
      puzzleRows[0][4].value = 3;
      puzzleRows[0][5].value = 4;
      puzzleRows[0][6].value = 5;
      puzzleRows[0][7].value = 6;
      puzzleRows[0][8].value = 7;
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
      const lockedValue = (puzzleSolver as any).findLockedPencilValueInRowsType2(1);
      expect(lockedValue).toBeDefined();
      expect(lockedValue?.value).toBe(1);
      expect(lockedValue?.rowIndex).toBe(0);
      expect(lockedValue?.colIndex).toBeUndefined();
      expect(lockedValue?.block).toBe(0);
    })
    test('findLockedPencilValue returns locked value in col type 2', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[3][0].value = 2;
      puzzleRows[4][0].value = 3;
      puzzleRows[5][0].value = 4;
      puzzleRows[6][0].value = 5;
      puzzleRows[7][0].value = 6;
      puzzleRows[8][0].value = 7;
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
      const lockedValue = (puzzleSolver as any).findLockedPencilValueInColsType2(1);
      expect(lockedValue).toBeDefined();
      expect(lockedValue?.value).toBe(1);
      expect(lockedValue?.rowIndex).toBeUndefined();
      expect(lockedValue?.colIndex).toBe(0);
      expect(lockedValue?.block).toBe(0);
    })
    test('findAllLockedPencilValues returns empty array when locked pencil values do not exist', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
      const lockedValues = puzzleSolver.findAllLockedCandidates();
      expect(lockedValues.length).toBe(0);
    })
  })
  describe('numberWorksInCell tests', () => {
    test("numberWorksInCell returns false when there are conflicts", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[0][1].value = 1;
      puzzleRows[3][3].value = 2;
      puzzleRows[8][8].value = 3;
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      expect(puzzleSolver.numberWorksInCell(0,0,1)).toBe(false); // Row conflict
      expect(puzzleSolver.numberWorksInCell(8,3,2)).toBe(false); // Column conflict
      expect(puzzleSolver.numberWorksInCell(6,6,3)).toBe(false); // Block conflict
    })
    test('numberWorksInCell() returns true when a cell has no conflicts', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      puzzleSolver.fillPuzzleCandidates();
      const result = puzzleSolver.numberWorksInCell(8,8,1);
      expect(result).toBe(true);
    })
  })
  describe('isPuzzleSolved() tests', () => {
    test('isPuzzleSolved returns true when puzzle is complete with no errors', () => {
      const solvedPuzzleValues = [
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,4,5,6,7,8,9,1],
        [5,6,7,8,9,1,2,3,4],
        [8,9,1,2,3,4,5,6,7],
        [3,4,5,6,7,8,9,1,2],
        [6,7,8,9,1,2,3,4,5],
        [9,1,2,3,4,5,6,7,8]
      ]
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows[i][j].value = solvedPuzzleValues[i][j]
        }
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = puzzleSolver.isPuzzleSolved();
      expect(res).toBe(true)
    })
    test('isPuzzleSolved returns false when puzzle has conflicts', () => {
      const puzzleValues = [
        [9,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,4,5,6,7,8,9,1],
        [5,6,7,8,9,1,2,3,4],
        [8,9,1,2,3,4,5,6,7],
        [3,4,5,6,7,8,9,1,2],
        [6,7,8,9,1,2,3,4,5],
        [9,1,2,3,4,5,6,7,8]
      ]
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows[i][j].value = puzzleValues[i][j]
        }
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = puzzleSolver.isPuzzleSolved();
      expect(res).toBe(false)
    })
    test('isPuzzleSolved returns false when puzzle is missing values', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleRows2 = buildBlankPuzzleRows(9);
      const puzzleValues = [
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,4,5,6,7,8,9,1],
        [5,6,7,8,9,1,2,3,4],
        [8,9,1,2,3,4,5,6,7],
        [3,4,5,6,7,8,9,1,2],
        [6,7,8,9,1,2,3,4,5],
        [9,1,2,3,4,5,6,7,undefined]
      ]
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows2[i][j].value = puzzleValues[i][j]
        }
      }
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const puzzleSolver2 = new PuzzleSolverImplementation(puzzleRows2);
      const res = puzzleSolver.isPuzzleSolved();
      const res2 = puzzleSolver2.isPuzzleSolved();
      expect(res).toBe(false)
      expect(res2).toBe(false)
    })
  })
  describe('solvePuzzle() tests', () => {
    test('solvePuzzle solves puzzle with simple solution', () => {
      const puzzleValues = [
          [1,2,3,4,5,6,7,8,9],
          [4,5,6,7,8,9,1,2,3],
          [7,8,9,1,2,3,4,5,6],
          [2,3,4,5,6,7,8,9,1],
          [5,6,7,8,9,1,2,3,4],
          [8,9,1,2,3,4,5,6,7],
          [3,4,5,6,7,8,9,1,2],
          [6,7,8,9,1,2,3,4,5],
          [9,1,2,3,4,5,6,7,undefined]
        ]
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows[i][j].value = puzzleValues[i][j]
        }
      }
      const expectedInitialPuzzle = structuredClone(puzzleRows)
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = puzzleSolver.solvePuzzle();
      expect(puzzleSolver.isPuzzleSolved()).toBe(true);
      expect(puzzleSolver.getPuzzle()[8][8].value).toBe(8);
      expect(res.initialPuzzle).toEqual(expectedInitialPuzzle);
      expect(res.strategiesUsed.fullHouses).toBe(1)
    })
    test('solvePuzzle solves puzzle with easy solution', () => {
      const puzzleValues = [
        [1, undefined, 6, undefined, undefined, 5, 9, undefined, 2],
        [undefined, 7, 9, undefined, undefined, 6, undefined, undefined, 8],
        [undefined, undefined, undefined, 8, undefined, 3, 1, undefined, 6],
        [undefined, 6, undefined, undefined, 5, 8, 3, 2, undefined],
        [7, 3, undefined, undefined, 1,undefined, undefined, 6, undefined],
        [undefined, undefined, undefined, 6, 3, undefined, 5, 1, 9],
        [5, undefined, 8, 9, undefined, undefined, undefined, undefined, 3],
        [undefined, undefined, 3, 5, 7, undefined, undefined, undefined, undefined],
        [undefined, 4, undefined, undefined, undefined, 1, 2, 9, undefined]
      ]
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows[i][j].value = puzzleValues[i][j]
        }
      }
      const expectedInitialPuzzle = structuredClone(puzzleRows)
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = puzzleSolver.solvePuzzle();
      expect(puzzleSolver.isPuzzleSolved(res.initialPuzzle)).toBe(false)
      expect(puzzleSolver.isPuzzleSolved(res.solvedPuzzle)).toBe(true);
      expect(res.initialPuzzle).toEqual(expectedInitialPuzzle)
    })
    test('solvePuzzle solves puzzle with medium solution', () => {
      const puzzleValues = [
        [9, undefined, 4, undefined, 5, 3, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, 6, undefined, undefined, undefined, undefined],
        [6, undefined, undefined, 7, 2, undefined, 5, undefined, undefined],
        [2, 9, undefined, undefined, 8, undefined, 7, undefined, undefined],
        [undefined, undefined, 3, undefined, undefined, undefined, undefined, 5, undefined],
        [undefined, undefined, undefined, undefined, 1, undefined, undefined, 4, 8],
        [undefined, undefined, 6, undefined, undefined, 2, undefined, 1, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 7],
        [undefined, undefined, undefined, undefined, 9, undefined, undefined, undefined, 6]
      ]
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows[i][j].value = puzzleValues[i][j]
        }
      }
      const expectedInitialPuzzle = structuredClone(puzzleRows)
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = puzzleSolver.solvePuzzle();
      console.log(res.strategiesUsed)

      expect(puzzleSolver.isPuzzleSolved(res.initialPuzzle)).toBe(false)
      expect(puzzleSolver.isPuzzleSolved(res.solvedPuzzle)).toBe(true);
      expect(res.initialPuzzle).toEqual(expectedInitialPuzzle)
    })
    test('solvePuzzle solves puzzle with hard solution', () => {
      const puzzleValues = [
        [undefined,undefined,undefined,undefined,undefined,undefined,2,7,undefined],
        [6,undefined,undefined,undefined,5,undefined,undefined,3,undefined],
        [undefined,2,7,undefined,undefined,3,9,undefined,undefined],
        [undefined,undefined,2,3,undefined,8,undefined,1,undefined],
        [undefined, undefined,5,4,2,undefined,undefined,undefined,undefined],
        [undefined,undefined,undefined,undefined,undefined,undefined,8,undefined,undefined],
        [undefined,9,undefined,undefined,3,undefined,undefined,5,undefined],
        [2,undefined,undefined,7,undefined,undefined,undefined,9,3],
        [7,undefined,undefined,1,undefined,undefined,undefined,8,undefined]
      ]
      const puzzleRows = buildBlankPuzzleRows(9);
      for(let i = 0; i < puzzleRows.length; i++) {
        for(let j = 0; j < puzzleRows.length; j++) {
          puzzleRows[i][j].value = puzzleValues[i][j]
        }
      }
      const expectedInitialPuzzle = structuredClone(puzzleRows)
      const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
      const res = puzzleSolver.solvePuzzle();
      console.log(res.strategiesUsed)
      expect(puzzleSolver.isPuzzleSolved(res.initialPuzzle)).toBe(false)
      expect(puzzleSolver.isPuzzleSolved(res.solvedPuzzle)).toBe(true);
      expect(res.initialPuzzle).toEqual(expectedInitialPuzzle)
    })
    // test('solvePuzzle solves puzzle with expert solution', () => {
    //   const puzzleValues = [
    //     [9,8,4,6,undefined,undefined,5,undefined,1],
    //     [undefined,undefined,undefined,5,undefined,undefined,undefined,undefined,7],
    //     [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,9],
    //     [undefined,undefined,undefined,undefined,1,undefined,undefined,undefined,undefined],
    //     [undefined,2,undefined,7,undefined,3,1,undefined,undefined],
    //     [5,6,undefined,undefined,undefined,undefined,undefined,undefined,undefined],
    //     [8,undefined,undefined,undefined,undefined,undefined,4,9,6],
    //     [undefined,undefined,undefined,undefined,9,undefined,undefined,undefined,undefined],
    //     [1,undefined,undefined,2,8,undefined,undefined,undefined,undefined]
    //   ]
    //   const puzzleRows = buildBlankPuzzleRows(9);
    //   for(let i = 0; i < puzzleRows.length; i++) {
    //     for(let j = 0; j < puzzleRows.length; j++) {
    //       puzzleRows[i][j].value = puzzleValues[i][j]
    //     }
    //   }
    //   const puzzleSolver = new PuzzleSolverImplementation(puzzleRows);
    //   puzzleSolver.solvePuzzle();
    //   expect(puzzleSolver.isPuzzleSolved()).toBe(true);
    // })
  })
})
