import { describe, expect, beforeEach, test } from "vitest";

import { PuzzleGenerator } from "@/feature/sudoku/puzzleSolver/puzzleGenerator";
import { PuzzleSolverImplementation } from "@/feature/sudoku/puzzleSolver/puzzleSolverImplementation";
import { buildBlankPuzzleRows } from "@/feature/sudoku/utils/buildBlankPuzzleRows";
import { Row } from "@/feature/sudoku/datasource/models/row";
describe("PuzzleGenerator Tests", () => {
  let puzzleGenerator: PuzzleGenerator;
  let puzzleSolver: PuzzleSolverImplementation
  beforeEach(() => {
    puzzleSolver = new PuzzleSolverImplementation();
    puzzleGenerator = new PuzzleGenerator(puzzleSolver);
  })
  describe("fillPuzzleRandomly Tests", () => {
    test('fillPuzzleRandomly fills puzzle', () => {
      const puzzle = buildBlankPuzzleRows(9);
      (puzzleGenerator as any).fillPuzzleRandomly(puzzle);
      expect(puzzleSolver.isPuzzleSolved(puzzle)).toBe(true);
      puzzle.forEach((row: Row) => {
        expect(row.length).toBe(9);
        row.forEach((cell) => {
          expect(cell.value).not.toBeUndefined()
        })
      })
    })
  })
})
