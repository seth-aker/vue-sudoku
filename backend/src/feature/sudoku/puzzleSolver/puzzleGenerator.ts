import { Difficulty, difficultyScoreMin } from "../datasource/models/difficulty";
import { PuzzleSolver } from "./puzzleSolver";
import { buildBlankPuzzleRows} from '../utils/buildBlankPuzzleRows'
import { Row } from "../datasource/models/row";
import { shuffleArray } from "../utils/shuffleArray";
import { strategyScoreMap } from "./strategies";
export class PuzzleGenerator {
  private puzzleSolver: PuzzleSolver;
  DEFAULT_PUZZLE_SIZE = 9;
  constructor(puzzleSolver: PuzzleSolver) {
    this.puzzleSolver = puzzleSolver;
  }
  generatePuzzle(size: number, targetDifficulty: Difficulty['rating']) {
    let maxScore: number;
    switch(targetDifficulty) {
      case "easy": maxScore = difficultyScoreMin.medium; break;
      case "medium": maxScore = difficultyScoreMin.hard; break;
      case "hard": maxScore = difficultyScoreMin.impossible; break;
      case "impossible": maxScore = null;
    }
    let puzzleAtDifficulty = false;
    let puzzle = buildBlankPuzzleRows(size);
    this.fillPuzzleRandomly(puzzle)
    let difficulty: Difficulty;
    while(!puzzleAtDifficulty) {
      if(!this.removeValueAndTestForUniqueness(puzzle)) {
        puzzle = buildBlankPuzzleRows(9);
        this.fillPuzzleRandomly(puzzle)
        continue;
      }
      difficulty = this.determineDifficulty(puzzle);
      if(difficulty.rating === targetDifficulty && difficulty.score >= difficultyScoreMin[targetDifficulty]) {
        puzzleAtDifficulty = true;
      }
      if(targetDifficulty !== 'impossible' && difficulty.score > maxScore) {
        puzzle = buildBlankPuzzleRows(size)
        this.fillPuzzleRandomly(puzzle);
      } 
    } 
    // removes all candidates and sets cell types correctly.
    this.cleanPuzzle(puzzle)
    return { puzzle, difficulty };
  }

  private removeValueAndTestForUniqueness(puzzle: Row[]) {
    let removed = false;
    const filledCellLocations = [] as {rowIndex: number, colIndex:number}[]
    puzzle.forEach((row, rowIndex) => 
      row.forEach((cell, colIndex) => {
        if(cell.value) {
          filledCellLocations.push({rowIndex, colIndex}) 
        }
      })
    )
    shuffleArray(filledCellLocations);
    while(!removed) {
      if(filledCellLocations.length < 1) {
        return false;
      }
      const {rowIndex, colIndex} = filledCellLocations.pop();
      const cell = puzzle[rowIndex][colIndex];
      const backTrackValue = cell.value;
      cell.value = undefined
      if(!this.isUnique(puzzle)) {
        cell.value = backTrackValue;
      } else {
        removed = true;
      }
    }
    return true;
  }
  determineDifficulty(puzzle: Row[]) {
    const puzzleCopy = structuredClone(puzzle)
    const { strategiesUsed } = this.puzzleSolver.solvePuzzle(puzzleCopy);
    let totalScore = 0;
    for(const strategy of Object.keys(strategiesUsed)) {
      const count = strategiesUsed[strategy];
      if(count > 0) {
        totalScore += ((strategyScoreMap[strategy] || 0) * count);
      }
    }
    const rating: Difficulty['rating'] = totalScore > difficultyScoreMin.impossible ? 'impossible' : 
      totalScore > difficultyScoreMin.hard ? 'hard' : 
      totalScore > difficultyScoreMin.medium ? 'medium' : 'easy'
    
      return {score: totalScore, rating } as Difficulty
  }
  private fillPuzzleRandomly(puzzle: Row[]) {
    const emptyCell = this.findEmptyCell(puzzle);
    if(!emptyCell) {
      return true
    }
    const potentialValues = [] as number[];
    for(let i = 1; i <= puzzle.length; i++) {
      potentialValues.push(i);
    }
    shuffleArray(potentialValues);
    for(const value of potentialValues) {
      if(this.puzzleSolver.numberWorksInCell(emptyCell.rowIndex, emptyCell.colIndex, value, puzzle)) {
        puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = value;
        // Recursively fill puzzle
        if(this.fillPuzzleRandomly(puzzle)) {
          return true;
        }
        // backtrack if the puzzle value leads to a un-solvable puzzle
        puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = undefined;
      }
    }
    return false;
  }
  private findEmptyCell(puzzle: Row[]) {
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        if(!puzzle[rowIndex][colIndex].value) {
          return {rowIndex, colIndex}
        }
      }
    }
    return null;
  }

  isUnique(puzzle: Row[]) {
    const puzzleCopy = structuredClone(puzzle);
    let solutions = {count: 0};
    this.countSolutionsRecursive(puzzleCopy, solutions);
    return solutions.count === 1;
  }

  private countSolutionsRecursive(puzzle: Row[], solutions: {count: number}) {
    if(solutions.count > 1) {
      return;
    }
    const emptyCell = this.findEmptyCell(puzzle);
    if(!emptyCell) {
      solutions.count++
      return;
    }
    const potentialValues = [] as number[];
    for(let i = 1; i <= puzzle.length; i++) {
      potentialValues.push(i);
    }
    for(const value of potentialValues) {
      if(this.puzzleSolver.numberWorksInCell(emptyCell.rowIndex, emptyCell.colIndex, value, puzzle)) {
        puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = value;

        this.countSolutionsRecursive(puzzle, solutions)

        // backtrack if the puzzle value leads to a un-solvable puzzle
        puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = undefined;
      }
    }
  }
  private cleanPuzzle(puzzle: Row[]) {
    for(const row of puzzle) {
      for(const cell of row) {
        if(cell.value) {
          cell.type = 'prefilled'
        } else {
          cell.type = 'blank'
        }
        cell.candidates.clear();
      }
    }
  }
}
