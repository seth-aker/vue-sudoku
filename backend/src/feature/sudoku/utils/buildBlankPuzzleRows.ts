import { Cell } from "../datasource/models/cell"
import { Row } from "../datasource/models/row"

export function buildBlankPuzzleRows(rowLength: number) {
    if(!Number.isInteger(Math.sqrt(rowLength))){
      throw new Error(`Error: Square Root of rowLength not an integer`)
    }
    const rows = [] as Row[]
    for(let i = 0; i < rowLength; i++) {
      const row = [] as Row
      for(let j = 0; j < rowLength; j++) {
        const cell: Cell = {
          cellId: `C${j}${i}`,
          type: 'blank',
          value: undefined,
          candidates: new Set<number>()
        }
        row.push(cell)
      }
      rows.push(row)
    }
    return rows
  }
