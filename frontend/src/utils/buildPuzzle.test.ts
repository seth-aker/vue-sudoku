import { describe, it, expect} from 'vitest'
import { buildStandardPuzzleRows } from './buildPuzzle'

describe('Build Puzzle Tests', () => {
  it('buildStandardPuzzleRows returns complete set of rows for traditional puzzle', () => {
    const rows = buildStandardPuzzleRows();
    expect(rows.length).toBe(9);

    for(let i = 0; i < 9; i++){
      for(let j = 0; j < 9; j++) {
        const cell = rows[i][j]
        expect(cell).toEqual({
          type: 'original',
          value: ((i+j) % 9) + 1,
          pencilValues: []
        })
      }
    }
  })
})
