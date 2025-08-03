import { describe, test, expect } from "vitest";

import { PuzzleSolverImplementation2 } from "@/feature/sudoku/puzzleSolver/puzzleSolverImplementation2";
import { buildBlankPuzzleRows } from "@/feature/sudoku/utils/buildBlankPuzzleRows";

describe("PuzzleSolverImplementation2 tests", () => {
  describe("removeCandidateInRow Tests", () => {
    test('removeCandidateInRow only removes candidates from one row', () => {
      const rows = buildBlankPuzzleRows(9);
      const solver = new PuzzleSolverImplementation2();
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
      const solver = new PuzzleSolverImplementation2();
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
  describe("solvePuzzle() Tests", () => {
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
      const puzzleSolver = new PuzzleSolverImplementation2();
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
      const puzzleSolver = new PuzzleSolverImplementation2();
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
      const puzzleSolver = new PuzzleSolverImplementation2();
      const res = puzzleSolver.solvePuzzle(puzzleRows);
      console.log(res.strategiesUsed)
      console.log(res.solvedPuzzle)
      expect(puzzleSolver.isPuzzleSolved(res.initialPuzzle)).toBe(false)
      expect(puzzleSolver.isPuzzleSolved(res.solvedPuzzle)).toBe(true);
      expect(res.initialPuzzle).toEqual(expectedInitialPuzzle)
    })
  })
})
