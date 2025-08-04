import { describe, expect, beforeEach, test } from "vitest";

import { PuzzleGenerator } from "@/feature/sudoku/puzzleSolver/puzzleGenerator";
import { PuzzleSolverImplementation } from "@/feature/sudoku/puzzleSolver/puzzleSolverImplementation";
import { buildBlankPuzzleRows } from "@/feature/sudoku/utils/buildBlankPuzzleRows";
import { Row } from "@/feature/sudoku/datasource/models/row";
import { difficultyScoreMin } from "@/feature/sudoku/datasource/models/difficulty";
const puzzleSolver = new PuzzleSolverImplementation();
const puzzleGenerator = new PuzzleGenerator(puzzleSolver);
describe("PuzzleGenerator Tests", () => {
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
  describe("generatePuzzle() Tests", () => {
    test("generatePuzzle creates a unique puzzle with easy score", () => {
      const result = puzzleGenerator.generatePuzzle(9, 'easy');
      expect(result.difficulty.rating).toEqual("easy");
      expect(result.difficulty.score).toBeGreaterThanOrEqual(difficultyScoreMin.easy);
      expect(result.puzzle.length).toBe(9);
      result.puzzle.forEach((row) => {
        expect(row.length).toBe(9)
      })
    })
    test('generatePuzzle creates unique puzzle with medium score', () => {
      const result = puzzleGenerator.generatePuzzle(9, 'medium');
      expect(result.difficulty.rating).toEqual("medium");
      expect(result.difficulty.score).toBeGreaterThan(difficultyScoreMin.medium);
      expect(result.puzzle.length).toBe(9);
      result.puzzle.forEach((row) => {
        expect(row.length).toBe(9)
      })
    })
    test('generatePuzzle create unique puzzle with hard score', () => {
      const result = puzzleGenerator.generatePuzzle(9, 'hard');
      expect(result.difficulty.rating).toEqual("hard");
      expect(result.difficulty.score).toBeGreaterThan(difficultyScoreMin.hard);
      expect(result.puzzle.length).toBe(9);
      result.puzzle.forEach((row) => {
        expect(row.length).toBe(9)
      })
    }),
    test('generatePuzzle creates unique puzzle with impossible score', () => {
      const result = puzzleGenerator.generatePuzzle(9, 'impossible');
      expect(result.difficulty.rating).toEqual("impossible");
      expect(result.difficulty.score).toBeGreaterThan(difficultyScoreMin.impossible);
      expect(result.puzzle.length).toBe(9);
      result.puzzle.forEach((row) => {
        expect(row.length).toBe(9)
      })
    })
  })
})
