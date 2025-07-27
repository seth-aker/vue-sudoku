import { Row } from "../datasource/models/row";
import { StrategiesUsed } from "./strategies";

export class PuzzleSolver {
  fillPuzzlePencilValues: (puzzleRows?: Row[]) => Row[];
  fillCellPencilValues:(rowIndex: number, colIndex: number, puzzleRows?: Row[]) => void
  solvePuzzle: (puzzleRows?: Row[]) => {initialPuzzle: Row[], solvedPuzzle: Row[], strategiesUsed: StrategiesUsed}
  isPuzzleSolved: (puzzleRows?: Row[]) => boolean
  numberWorksInCell: (rowIndex: number, colIndex: number, potentialNum: number, puzzleRows: Row[]) => boolean
  getPuzzle: () => Row[];
  setPuzzle: (puzzle: Row[]) => void
}
