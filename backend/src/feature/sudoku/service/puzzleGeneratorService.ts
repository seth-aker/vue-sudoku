import { PuzzleOptions } from "../datasource/models/puzzleOptions";

export interface PuzzleGeneratorService {
  generatePuzzles: (count: number, options: PuzzleOptions) => Promise<void>
}
