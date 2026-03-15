import { type PuzzleOptions } from "../datasource/models/puzzleOptions";
import { type CreatePuzzle } from "../datasource/models/sudokuPuzzle";
import { spawn } from 'node:child_process'
import { workerEmit, worker } from "workerpool";
import { buildBlankPuzzleRows } from "../utils/buildBlankPuzzleRows";
import { type DifficultyRating, difficultyScoreMin } from "../datasource/models/difficulty";
import { config } from "../../../core/config";
import { PuzzleGeneratorError } from "../errors/puzzleGeneratorError";
export function generatePuzzles(number: number, options: PuzzleOptions) {
  const generatorPath = `${config.rootDir}/puzzle_generator`;
  let difficulty: string;
  switch (options.difficulty) {
    case 'easy': 
      difficulty = "EASY";
      break;
    case 'medium':
      difficulty = "MEDIUM";
      break;
    case 'hard': 
      difficulty = "HARD";
      break;
    case "impossible":
      difficulty = "IMPOSSIBLE";
      break;
    default:
      difficulty = "BEGINNER"
      break;
  }

  const args = [
    `${number}`,
    difficulty
  ];
  return new Promise<void>((resolve, reject) => {
    console.log(args)
    console.log(generatorPath)
    const generator = spawn(generatorPath, args)
    let buffer = '';
    generator.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for(const line of lines) {
        if(line.trim().length > 0) {
          const puzzle = processPuzzle(line);
          workerEmit(puzzle);
        }
      }  
    })
    generator.on('close', (code) => {
      if(buffer.trim().length >0) {
        const puzzle = processPuzzle(buffer);
        workerEmit(puzzle);
      }
      if(code === 0) {
        resolve();
      } else {
        reject(new PuzzleGeneratorError(`Generator exited with code ${code}`))
      }
    })
    generator.on('error', (err) => {
      reject(err);
    })
  })
}
worker({generatePuzzles})

function processPuzzle(puzzleString: string): CreatePuzzle{
  const puzzle = buildBlankPuzzleRows(9);
  const [cellValues, difficultyScoreStr] = puzzleString.split(",");
  puzzle.forEach((row, ri) => {
    const rowMod = ri * 9;
    row.forEach((cell, ci) => {
      const cellIndex = ci + rowMod;
      if(cellValues[cellIndex] !== '0') {
        cell.value = Number.parseInt(cellValues[cellIndex]);
      }
    })
  })
  const difficultyScore = Number.parseInt(difficultyScoreStr);
  let difficultyRating: DifficultyRating = 'easy';
  for(const key of Object.keys(difficultyScoreMin)) {
    if(difficultyScoreMin[key] > difficultyScore) {
      difficultyRating = key as DifficultyRating;
    }
  }
  return {
    cells: puzzle,
    difficulty: {
      score: difficultyScore,
      rating: difficultyRating
    }
  }
}