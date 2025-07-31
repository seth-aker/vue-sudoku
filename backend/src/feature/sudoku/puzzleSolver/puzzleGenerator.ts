import { Difficulty } from "../datasource/models/difficulty";
import { PuzzleSolver } from "./puzzleSolver";
import { buildBlankPuzzleRows} from '../utils/buildBlankPuzzleRows'
import { Row } from "../datasource/models/row";
import { PuzzleSolverError } from "../errors/puzzleSolverError";
import { shuffleArray } from "../utils/shuffleArray";
export class PuzzleGenerator {
  private puzzleSolver: PuzzleSolver
  constructor(puzzleSolver: PuzzleSolver) {
    this.puzzleSolver = puzzleSolver;
  }
  generatePuzzle(size: number, difficulty: Difficulty) {
    
    let puzzleGenerated = false;
    let attempts = 0;
    while(!puzzleGenerated) {
      const puzzle = buildBlankPuzzleRows(size);
      this.fillPuzzleRandomly(puzzle)
      
    } 
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
  
}
