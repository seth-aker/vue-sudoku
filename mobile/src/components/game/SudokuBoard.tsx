import { useState, useMemo } from 'react'
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native'
import { useGameStore } from '@/stores'
import { blockOf, cellHasError, colOf, rowOf } from '@/game'
import { BOARD_SIZE } from '@/types'
import { useTheme } from '@/theme'
import { Cell } from './Cell'

interface SudokuBoardProps {
  /** Hard maximum width in dp. The board still respects parent width and stays square. */
  maxSize?: number
  style?: ViewStyle
}

/**
 * 9x9 board, sized to the available width via onLayout. Renders cells in a flat
 * loop and routes taps through useGameStore.selectCell. Highlighting decisions
 * (peer / same value / error) are computed here so Cell can stay dumb.
 */
export function SudokuBoard({ maxSize = 480, style }: SudokuBoardProps) {
  const { theme } = useTheme()
  const cells = useGameStore((s) => s.cells)
  const selectedIdx = useGameStore((s) => s.selectedIdx)
  const originalCells = useGameStore((s) => s.originalCells)
  const selectCell = useGameStore((s) => s.selectCell)

  // Measure once; subsequent renders use the cached size.
  const [boardSize, setBoardSize] = useState<number | null>(null)

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.floor(Math.min(e.nativeEvent.layout.width, maxSize))
    if (w !== boardSize && w > 0) setBoardSize(w)
  }

  // Precompute selection-derived flags once per render.
  const sel = useMemo(() => {
    if (selectedIdx === null) return null
    return {
      row: rowOf(selectedIdx),
      col: colOf(selectedIdx),
      block: blockOf(selectedIdx),
      value: cells[selectedIdx]?.value ?? 0,
    }
  }, [selectedIdx, cells])

  // Compute the cell size as a whole number so border rendering is crisp.
  const cellSize = boardSize !== null ? Math.floor(boardSize / BOARD_SIZE) : 0
  const realBoardSize = cellSize * BOARD_SIZE

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          aspectRatio: 1,
          alignSelf: 'center',
          width: '100%',
          maxWidth: maxSize,
          // Outer border (right + bottom hairlines done per-cell; we add right + bottom here).
          backgroundColor: theme.colors.card,
        },
        style,
      ]}
    >
      {boardSize !== null && (
        <View
          style={{
            width: realBoardSize,
            height: realBoardSize,
            borderRightWidth: 2,
            borderBottomWidth: 2,
            borderColor: theme.colors.border,
            alignSelf: 'center',
          }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, r) => (
            <View key={r} style={{ flexDirection: 'row' }}>
              {Array.from({ length: BOARD_SIZE }, (_, c) => {
                const idx = r * BOARD_SIZE + c
                const cell = cells[idx]
                const isSelected = idx === selectedIdx
                const isPeer =
                  sel !== null && !isSelected &&
                  (sel.row === r || sel.col === c || sel.block === blockOf(idx))
                const sameValue =
                  sel !== null && sel.value !== 0 && !isSelected && cell.value === sel.value
                return (
                  <Cell
                    key={idx}
                    cell={cell}
                    original={originalCells[idx]}
                    size={cellSize}
                    selected={isSelected}
                    isPeer={isPeer}
                    sameValueAsSelected={sameValue}
                    hasError={cellHasError(cells, idx)}
                    thickRightBorder={c === 2 || c === 5}
                    thickBottomBorder={r === 2 || r === 5}
                    onPress={() => selectCell(idx)}
                  />
                )
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
