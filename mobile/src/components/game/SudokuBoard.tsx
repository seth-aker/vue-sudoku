import { useMemo, useState } from 'react'
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native'
import { useGameStore } from '@/stores'
import { blockOf, cellHasError, colOf, rowOf } from '@/game'
import { BLOCK_SIZE, BOARD_SIZE } from '@/types'
import { useTheme } from '@/theme'
import { Cell } from './Cell'

interface SudokuBoardProps {
  /** Hard maximum width in dp. The board still respects parent width and stays square. */
  maxSize?: number
  style?: ViewStyle
}

/**
 * 9x9 board. Layout mirrors the Vue web app's SudokuPuzzle.vue:
 *   - 3px BLACK outer frame
 *   - inner area filled with the "gap" color (gray-500 light / background dark)
 *   - 3 block-rows × 3 block-cols, with 3px gap-color between blocks
 *   - each block is a tight 3x3 of cells with 1px hairline outlines
 *
 * Sized via onLayout to fit the available width (capped by maxSize). Cell size
 * is computed in whole pixels so the layout is crisp.
 */
const FRAME_PX = 3   // black outer frame thickness
const GAP_PX = 3     // gap-color thickness between blocks

export function SudokuBoard({ maxSize = 480, style }: SudokuBoardProps) {
  const { theme } = useTheme()
  const cells = useGameStore((s) => s.cells)
  const selectedIdx = useGameStore((s) => s.selectedIdx)
  const originalCells = useGameStore((s) => s.originalCells)
  const selectCell = useGameStore((s) => s.selectCell)

  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.floor(Math.min(e.nativeEvent.layout.width, maxSize))
    if (w !== containerWidth && w > 0) setContainerWidth(w)
  }

  const sel = useMemo(() => {
    if (selectedIdx === null) return null
    return {
      row: rowOf(selectedIdx),
      col: colOf(selectedIdx),
      block: blockOf(selectedIdx),
    }
  }, [selectedIdx])

  let cellSize = 0
  let totalSize = 0
  if (containerWidth !== null) {
    // total = FRAME*2 + GAP*2 (between the 3 blocks) + cellSize*9
    const cellsArea = containerWidth - FRAME_PX * 2 - GAP_PX * 2
    cellSize = Math.max(24, Math.floor(cellsArea / BOARD_SIZE))
    totalSize = cellSize * BOARD_SIZE + FRAME_PX * 2 + GAP_PX * 2
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          width: '100%',
          maxWidth: maxSize,
          alignSelf: 'center',
          aspectRatio: 1,
        },
        style,
      ]}
    >
      {containerWidth !== null && (
        <View
          style={{
            width: totalSize,
            height: totalSize,
            alignSelf: 'center',
            backgroundColor: theme.colors.boardOuter,
            padding: FRAME_PX,
          }}
        >
          {/* Inner wrap supplies the gap color that shows through between blocks. */}
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.boardInner,
              flexDirection: 'column',
            }}
          >
            {[0, 1, 2].map((br) => (
              <View
                key={br}
                style={{
                  flexDirection: 'row',
                  marginBottom: br < 2 ? GAP_PX : 0,
                  flex: 1,
                }}
              >
                {[0, 1, 2].map((bc) => (
                  <View
                    key={bc}
                    style={{
                      marginRight: bc < 2 ? GAP_PX : 0,
                      flexDirection: 'column',
                    }}
                  >
                    {[0, 1, 2].map((dr) => (
                      <View key={dr} style={{ flexDirection: 'row' }}>
                        {[0, 1, 2].map((dc) => {
                          const r = br * BLOCK_SIZE + dr
                          const c = bc * BLOCK_SIZE + dc
                          const idx = r * BOARD_SIZE + c
                          const cell = cells[idx]
                          const original = originalCells[idx]
                          const isSelected = idx === selectedIdx
                          const isPeer =
                            sel !== null &&
                            !isSelected &&
                            (sel.row === r || sel.col === c || sel.block === blockOf(idx))
                          return (
                            <Cell
                              key={idx}
                              cell={cell}
                              original={original}
                              size={cellSize}
                              selected={isSelected}
                              isPeer={isPeer}
                              hasError={cellHasError(cells, idx)}
                              onPress={() => selectCell(idx)}
                            />
                          )
                        })}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
