import { type PuzzleOptions } from "../datasource/models/puzzleOptions";
import { type CreatePuzzle } from "../datasource/models/sudokuPuzzle";
import { execFileSync } from 'node:child_process'
import { buildBlankPuzzleRows } from "../utils/buildBlankPuzzleRows";
import { type DifficultyRating, difficultyScoreMin } from "../datasource/models/difficulty";
import { config } from "../../../core/config";
import workerpool from 'workerpool'
function generatePuzzles(number: number, options: PuzzleOptions) {
  const puzzles = [] as CreatePuzzle[];
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
  try {
    const stdout = execFileSync(generatorPath, args).toString();
    puzzles.push(...processPuzzles(stdout))
  } catch(err) {
    console.error(`Error executing file at path: ${generatorPath}. Error: ${err}`);
  }
  return puzzles;
}
workerpool.worker({generatePuzzles})

function processPuzzles(stdout: string): CreatePuzzle[] {
  const puzzles = stdout.split("\n");
  return puzzles.map((puzzleString) => {
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
    for(const key in Object.keys(difficultyScoreMin)) {
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
  })
}