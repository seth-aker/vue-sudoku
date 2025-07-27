import { Difficulty } from "../datasource/models/difficulty";
import { PuzzleSolver } from "./puzzleSolver";
import { buildBlankPuzzleRows} from '../utils/buildBlankPuzzleRows.ts'
import { Row } from "../datasource/models/row.ts";
import { PuzzleSolverError } from "../errors/puzzleSolverError.ts";
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

    } 
  }

  private fillPuzzleRandomly(puzzle: Row[]) {
    while(!this.puzzleSolver.isPuzzleSolved(puzzle)) {
      const rowIndex = Math.floor(Math.random() * 9);
      const colIndex = Math.floor(Math.random() * 9);
      const value = Math.floor(Math.random() * 9) + 1;
      if(!this.puzzleSolver.numberWorksInCell(rowIndex, colIndex, value, puzzle)) {
        continue;
      }
      puzzle[rowIndex][colIndex].value = value;
      try {
        const result = this.puzzleSolver.solvePuzzle(puzzle);
        
      } catch (err) {
        if(err instanceof PuzzleSolverError) {
          continue;
        } else {
          throw err;
        }
      }

    }
  }
}
