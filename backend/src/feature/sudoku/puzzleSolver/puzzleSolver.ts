import { type Row } from "../datasource/models/row.ts";
import { type StrategiesUsed } from "./strategies.ts";

export class PuzzleSolver {
  fillPuzzleCandidates: (puzzleRows?: Row[]) => Row[];
  solvePuzzle: (puzzleRows?: Row[]) => {initialPuzzle: Row[], solvedPuzzle: Row[], strategiesUsed: StrategiesUsed}
  isPuzzleSolved: (puzzleRows?: Row[], validate?: boolean) => boolean
  numberWorksInCell: (rowIndex: number, colIndex: number, potentialNum: number, puzzleRows: Row[]) => boolean
}
