import { buildBlankCells, buildStandardCells } from '@/game/buildPuzzle'
import { CELL_COUNT } from '@/types'
import { colOf, rowOf } from '@/game/board'

describe('buildBlankCells', () => {
  it('returns 81 empty cells with sequential idx', () => {
    const cells = buildBlankCells()
    expect(cells).toHaveLength(CELL_COUNT)
    cells.forEach((cell, i) => {
      expect(cell.idx).toBe(i)
      expect(cell.value).toBe(0)
      expect(cell.candidates).toEqual([])
    })
  })
})

describe('buildStandardCells', () => {
  it('returns 81 cells matching the (row+col) % 9 + 1 pattern', () => {
    const cells = buildStandardCells()
    expect(cells).toHaveLength(CELL_COUNT)
    cells.forEach((cell, i) => {
      expect(cell.idx).toBe(i)
      expect(cell.value).toBe(((rowOf(i) + colOf(i)) % 9) + 1)
      expect(cell.candidates).toEqual([])
    })
  })
})
