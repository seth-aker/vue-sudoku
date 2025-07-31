import { describe, expect, beforeEach, test } from "vitest";

import { PuzzleGenerator } from "@/feature/sudoku/puzzleSolver/puzzleGenerator";
import { PuzzleSolverImplementation } from "@/feature/sudoku/puzzleSolver/puzzleSolverImplementation";
import { buildBlankPuzzleRows } from "@/feature/sudoku/utils/buildBlankPuzzleRows";
import { Row } from "@/feature/sudoku/datasource/models/row";
describe("PuzzleGenerator Tests", () => {
  let puzzleGenerator: PuzzleGenerator;
  let puzzleSolver: PuzzleSolverImplementation
  beforeEach(() => {
    const rows = buildBlankPuzzleRows(9);
    puzzleSolver = new PuzzleSolverImplementation(rows);
    puzzleGenerator = new PuzzleGenerator(puzzleSolver);
  })
  describe("fillPuzzleRandomly Tests", () => {
    test('fillPuzzleRandomly fills puzzle', () => {
      const puzzle = buildBlankPuzzleRows(9)
      const filledPuzzle = (puzzleGenerator as any).fillPuzzleRandomly(puzzle);
      expect(puzzleSolver.isPuzzleSolved(filledPuzzle)).toBe(true);
      puzzle.forEach((row: Row) => {
        expect(row.length).toBe(9);
        row.forEach((cell) => {
          expect(cell.value).not.toBeUndefined()
        })
      })
    })
  })
})
