import { describe, test, expect } from "vitest";

import { PuzzleSolverImplementation } from "@/feature/sudoku/puzzleSolver/puzzleSolverImplementation";
import { buildBlankPuzzleRows } from "@/feature/sudoku/utils/buildBlankPuzzleRows";

describe("PuzzleSolverImplementation tests", () => {
   describe("fillPuzzleCandidates() Tests", () => {
      test("fillPuzzleCandidates fills all candidates for all cells", () => {
        const puzzleRows = buildBlankPuzzleRows(9);
        const puzzleSolver = new PuzzleSolverImplementation();
        const filledRows = puzzleSolver.fillPuzzleCandidates(puzzleRows);
        
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
      test('fillPuzzleCandidates only fills one number for cell that has one option in row, column or block', () => {
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
  
        const puzzleSolver1 = new PuzzleSolverImplementation();
        const puzzleSolver2 = new PuzzleSolverImplementation();
        const puzzleSolver3 = new PuzzleSolverImplementation()
        puzzleSolver1.fillPuzzleCandidates(puzzleRows1)
        puzzleSolver2.fillPuzzleCandidates(puzzleRows2)
        puzzleSolver3.fillPuzzleCandidates(puzzleRows3)
        expect(puzzleRows1[0][0].candidates).toEqual(new Set([9]))
        expect(puzzleRows2[0][0].candidates).toEqual(new Set([9]))
        expect(puzzleRows3[0][0].candidates).toEqual(new Set([9]))
      })
      test('fillCellPencilValues doesn\'t duplicate pencil values', () => {
        const puzzleRows = buildBlankPuzzleRows(9);
        puzzleRows[0][0].candidates = new Set<number>([1,2,3,4,5,6,7,8,9])
        const puzzleSolver = new PuzzleSolverImplementation();
        puzzleSolver.fillPuzzleCandidates(puzzleRows);
        expect(puzzleRows[0][0].candidates).toEqual(new Set([1,2,3,4,5,6,7,8,9]))
      })
    })
  describe("removeCandidateInRow Tests", () => {
    test('removeCandidateInRow only removes candidates from one row', () => {
      const rows = buildBlankPuzzleRows(9);
      const solver = new PuzzleSolverImplementation();
      solver.fillPuzzleCandidates(rows);
      (solver as any).removeCandidateInRow(1, 0, rows);
      rows[0].forEach((cell) => {
        expect(cell.candidates.has(1)).toBe(false);
      })
      for(let i = 1; i < rows.length; i++) {
        rows[i].forEach((cell) => {
          expect(cell.candidates.has(1));
        })
      }
    })
    test('removeCandidateInBlock only removes candidates from one block', () => {
      const rows = buildBlankPuzzleRows(9);
      const solver = new PuzzleSolverImplementation();
      solver.fillPuzzleCandidates(rows);
      const removed = (solver as any).removeCandidateInBlock(1, 0, rows);
      expect(removed.length).toBe(9);
      expect(removed[0].rowIndex).toBe(0);
      expect(removed[1].rowIndex).toBe(0);
      expect(removed[2].rowIndex).toBe(0);
      expect(removed[0].colIndex).toBe(0);
      expect(removed[1].colIndex).toBe(1);
      expect(removed[2].colIndex).toBe(2);
      removed.forEach((element) => expect(element.value).toBe(1))
      const block = solver.getBlock(0, rows);
      block.forEach((cell) => {
        expect(cell.candidates.size).toBe(8);
        expect(cell.candidates.has(1)).toBe(false);
      })

    })
  })
  describe('numberWorksInCell tests', () => {
    test("numberWorksInCell returns false when there are conflicts", () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      puzzleRows[0][1].value = 1;
      puzzleRows[3][3].value = 2;
      puzzleRows[8][8].value = 3;
      const puzzleSolver = new PuzzleSolverImplementation();
      expect(puzzleSolver.numberWorksInCell(0,0,1,puzzleRows)).toBe(false); // Row conflict
      expect(puzzleSolver.numberWorksInCell(8,3,2,puzzleRows)).toBe(false); // Column conflict
      expect(puzzleSolver.numberWorksInCell(6,6,3,puzzleRows)).toBe(false); // Block conflict
    })
    test('numberWorksInCell() returns true when a cell has no conflicts', () => {
      const puzzleRows = buildBlankPuzzleRows(9);
      const puzzleSolver = new PuzzleSolverImplementation();
      puzzleSolver.fillPuzzleCandidates(puzzleRows);
      const result = puzzleSolver.numberWorksInCell(8,8,1, puzzleRows);
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
      const puzzleSolver = new PuzzleSolverImplementation();
      const res = puzzleSolver.isPuzzleSolved(puzzleRows);
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
      const puzzleSolver = new PuzzleSolverImplementation();
      const res = puzzleSolver.isPuzzleSolved(puzzleRows);
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
      const puzzleSolver = new PuzzleSolverImplementation();
      const puzzleSolver2 = new PuzzleSolverImplementation();
      const res = puzzleSolver.isPuzzleSolved(puzzleRows);
      const res2 = puzzleSolver2.isPuzzleSolved(puzzleRows2);
      expect(res).toBe(false)
      expect(res2).toBe(false)
    })
  })
  describe("solvePuzzle() Tests", () => {
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
        const puzzleSolver = new PuzzleSolverImplementation();
        const res = puzzleSolver.solvePuzzle(puzzleRows);
        expect(puzzleSolver.isPuzzleSolved(puzzleRows)).toBe(true);
        expect(puzzleRows[8][8].value).toBe(8);
        expect(res.initialPuzzle).toEqual(expectedInitialPuzzle);
        expect(res.strategiesUsed.fullHouses).toBe(1)
      })
    test('solvePuzzle() solves easy puzzle', () => {
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
      const puzzleSolver = new PuzzleSolverImplementation();
      const res = puzzleSolver.solvePuzzle(puzzleRows);
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
      const puzzleSolver = new PuzzleSolverImplementation();
      const res = puzzleSolver.solvePuzzle(puzzleRows);
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
      const puzzleSolver = new PuzzleSolverImplementation();
      const res = puzzleSolver.solvePuzzle(puzzleRows);
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
    //   const puzzleSolver = new PuzzleSolverImplementation();
    //   const res = puzzleSolver.solvePuzzle(puzzleRows);
    //   console.log(res.strategiesUsed)
    //   expect(puzzleSolver.isPuzzleSolved(res.initialPuzzle)).toBe(false);
    //   expect(puzzleSolver.isPuzzleSolved(res.solvedPuzzle)).toBe(true);
    // })
  })
})
