import type { Row } from "@/stores/models/row";

  export function calcBlockNum(rowIndex: number, colIndex: number, puzzleRows: Row[]) {
    const blockWidth = Math.sqrt(puzzleRows.length);
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth);
    const blockNumber = blockX + (blockY * blockWidth);
    return blockNumber;
  }
