import type { Cell } from "@/stores/models/cell"
import type { Row } from "@/stores/models/row"

export function buildStandardPuzzleRows() {
  const rows = [] as Row[]
    for(let i = 0; i < 9; i++) {
      const row = [] as Row
      for(let j = 0; j < 9; j++) {
        const cell: Cell = {
          cellId: `C${j}${i}`,
          type: 'prefilled',
          value: ((i + j) % 9) + 1,
          pencilValues: []
        }
        row.push(cell)
      }
      rows.push(row)
    }
    return rows
}
export function buildBlankPuzzleRows() {
  const rows = [] as Row[]
    for(let i = 0; i < 9; i++) {
      const row = [] as Row
      for(let j = 0; j < 9; j++) {
        const cell: Cell = {
          cellId: `C${j}${i}`,
          type: 'blank',
          value: undefined,
          pencilValues: []
        }
        row.push(cell)
      }
      rows.push(row)
    }
    return rows
}
