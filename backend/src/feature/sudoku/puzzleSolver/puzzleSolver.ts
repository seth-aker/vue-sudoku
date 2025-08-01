import { Row } from "../datasource/models/row";
import { StrategiesUsed } from "./strategies";

export class PuzzleSolver {
  fillPuzzleCandidates: (puzzleRows?: Row[]) => Row[];
  solvePuzzle: (puzzleRows?: Row[]) => {initialPuzzle: Row[], solvedPuzzle: Row[], strategiesUsed: StrategiesUsed}
  isPuzzleSolved: (puzzleRows?: Row[], validate?: boolean) => boolean
  numberWorksInCell: (rowIndex: number, colIndex: number, potentialNum: number, puzzleRows: Row[]) => boolean
}
