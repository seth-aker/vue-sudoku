import workerpool from 'workerpool'

import { PuzzleGenerator } from './puzzleGenerator'
import { PuzzleSolverImplementation } from './puzzleSolverImplementation'
import PuzzleOptions from '../datasource/models/puzzleOptions';
import { CreatePuzzle } from '../datasource/models/sudokuPuzzle';

const solver = new PuzzleSolverImplementation();
const generator = new PuzzleGenerator(solver);
function generatePuzzles(number: number, options: PuzzleOptions) {
    const puzzles = [] as CreatePuzzle[]
    const puzzleSize = generator.DEFAULT_PUZZLE_SIZE;
    for(let i = 0; i < number; i++) {
      const puzzle = generator.generatePuzzle(puzzleSize, options.difficulty.rating);
      puzzles.push({cells: puzzle.puzzle, difficulty: puzzle.difficulty});
    }
    console.log(`[Puzzle Generator] generated ${number}} puzzles of difficulty: ${options.difficulty.rating}`);
    return puzzles;
  }

workerpool.worker({generatePuzzles})
