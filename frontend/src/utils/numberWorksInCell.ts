import type { SudokuPuzzle } from "@/stores/models/puzzle";

  export function numberWorksInCell(rowIndex: number, colIndex: number, potentialNum: number, puzzle: SudokuPuzzle) {
    const cell = puzzle.rows[rowIndex][colIndex];
    const blockWidth = Math.floor(Math.sqrt(puzzle.rows.length));
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth)
    const blockNum = blockX + (blockY * blockWidth);
    const block = puzzle.getBlock(blockNum)?.filter((eachCell) => eachCell.cellId !== cell.cellId);
    const row = puzzle.rows[rowIndex].filter((eachCell) => eachCell.cellId != cell.cellId)
    const col = puzzle.getColumn(colIndex)?.filter((eachCell) => eachCell.cellId !== cell.cellId)

    if(block?.some((eachCell) => eachCell.value === potentialNum)) {
      return false
    }
    if(row.some((eachCell) => eachCell.value === potentialNum)) {
      return false
    }
    if(col?.some((eachCell) => eachCell.value === potentialNum)) {
      return false;
    }
    return true;
  }
