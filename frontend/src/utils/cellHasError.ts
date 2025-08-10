import type { SudokuPuzzle } from "@/stores/models/puzzle";

export const cellHasError = (puzzle: SudokuPuzzle, columnIndex: number, rowIndex: number) => {
  const blockLength = Math.sqrt(puzzle.cellsPerRow ?? 0)
  const cell = puzzle.getCell(columnIndex, rowIndex);
  if (cell === undefined || cell.value === null) return false;
  const blockX = Math.floor(columnIndex / blockLength);
  const blockY = Math.floor(rowIndex / blockLength)
  const blockNum = blockX + (blockY * blockLength);
  const block = puzzle.getBlock(blockNum)?.filter((each) => each.cellId !== cell.cellId);
  const row = puzzle.rows[rowIndex]?.filter((each) => each.cellId !== cell.cellId);
  const column = puzzle.getColumn(columnIndex)?.filter((each) => each.cellId !== cell.cellId);

  if (block?.some((each) => each.value === cell.value)) {
    // console.log('Block error')
    return true;
  }
  if (row.some((each) => each.value === cell.value)) {
    // console.log("Row error")
    return true;
  }
  if (column?.some((each) => each.value === cell.value)) {
    // console.log("Column Error")
    return true;
  }
  return false;
}
