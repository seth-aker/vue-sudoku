import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Cell as CellType } from '@/types'
import { useTheme, type Theme } from '@/theme'
import { cellStatus } from '@/game'

interface CellProps {
  cell: CellType
  original: CellType
  size: number
  selected: boolean
  /** Same row/column/block as the selected cell (peer highlight). */
  isPeer: boolean
  hasError: boolean
  onPress: () => void
}

/**
 * A single sudoku cell. Matches the web's Cell.vue:
 *  - default bg: white (both modes — web keeps the board paper-light)
 *  - selected bg: orange-400
 *  - peer-highlighted bg: orange-200 (light) / orange-300 (dark)
 *  - cell text: always black
 *  - error: text color is red, background stays whatever it would have been
 *  - prefilled cells render bold; edited cells render regular weight
 *  - empty cells render up to 9 candidate digits in a 3x3 micro-grid
 *
 * No "same-value-as-selected" highlight — the web doesn't have one.
 *
 * Block-boundary borders are handled by the parent Board. This component
 * just renders the per-cell hairline outline.
 */
function CellInner({ cell, original, size, selected, isPeer, hasError, onPress }: CellProps) {
  const { theme } = useTheme()
  const status = cellStatus(cell, original)

  const bg = selected
    ? theme.colors.cellSelected
    : isPeer
      ? theme.colors.cellHighlight
      : theme.colors.cellBg
  const fg = hasError ? theme.colors.cellTextError : theme.colors.cellText

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.cellOutline,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel={
        cell.value !== 0
          ? `Cell ${cell.value}${status === 'prefilled' ? ' (prefilled)' : ''}`
          : `Empty cell, candidates ${cell.candidates.join(' ')}`
      }
      accessibilityState={{ selected }}
    >
      {cell.value !== 0 ? (
        <Text
          style={{
            color: fg,
            fontSize: Math.floor(size * 0.55),
            fontWeight: status === 'prefilled' ? '700' : '400',
            includeFontPadding: false,
          }}
        >
          {cell.value}
        </Text>
      ) : cell.candidates.length > 0 ? (
        <Candidates candidates={cell.candidates} size={size} theme={theme} />
      ) : null}
    </Pressable>
  )
}

function Candidates({
  candidates,
  size,
  theme,
}: {
  candidates: number[]
  size: number
  theme: Theme
}) {
  const present = new Set(candidates)
  // Web uses `text-2xs` = 8px. Scale slightly with cell size on bigger screens.
  const fontSize = Math.max(8, Math.floor(size * 0.22))
  return (
    <View
      style={{
        width: size,
        height: size,
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
        <View
          key={n}
          style={{
            width: '33.33%',
            height: '33.33%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: theme.colors.cellText,
              fontSize,
              fontWeight: '300',
              fontVariant: ['tabular-nums'],
              includeFontPadding: false,
            }}
          >
            {present.has(n) ? n : ''}
          </Text>
        </View>
      ))}
    </View>
  )
}

export const Cell = memo(CellInner)
