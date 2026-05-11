import path from "node:path";
import { PuzzleOptions } from "../datasource/models/puzzleOptions";
import { PuzzleGeneratorService } from "./puzzleGeneratorService";
import { DifficultyRating } from "../datasource/models/difficulty";
import { env } from "node:process";
import { tmpdir } from "node:os";
const RATING_ARG: Record<DifficultyRating, string> = {
  beginner: 'BEGINNER',
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
  impossible: 'IMPOSSIBLE',
}

const RATING_FROM_CODE: Record<string, DifficultyRating> = {
  '0': 'beginner',
  '1': 'easy',
  '2': 'medium',
  '3': 'hard',
  '4': 'impossible',
}
export class CPuzzleGeneratorService implements PuzzleGeneratorService {
  private readonly generatorPath: string
  constructor(generatorPath?: string) {
    if(generatorPath) {
      this.generatorPath = generatorPath;
    } else {
      this.generatorPath = path.join(process.cwd(), 'bin', 'puzzle_generator_app')
    }
  }
  async generatePuzzles(count: number, options: PuzzleOptions) {
    const args = [RATING_ARG[options.difficulty] ?? "BEGINNER", `${count}`]

    const childEnv = { ...env, LOG_DIR: env.LOG_DIR || path.join(tmpdir(), 'cdoku.log')}

    // return new Promise((resolve, reject) => {

    // })
  }
}
