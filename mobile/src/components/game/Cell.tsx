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
  /** Same value as the selected cell (value highlight). */
  sameValueAsSelected: boolean
  hasError: boolean
  /** True when this column is one of the 3x3 block boundaries (col 2 or 5). */
  thickRightBorder: boolean
  /** True when this row is one of the 3x3 block boundaries (row 2 or 5). */
  thickBottomBorder: boolean
  onPress: () => void
}

/**
 * A single sudoku cell. Renders either:
 *  - the cell's value (when filled), styled prefilled (bold) or edited (accent color), or
 *  - up to 9 candidate digits laid out in a 3x3 grid (when empty).
 *
 * Visual states (in priority order):
 *  - error: red-tinted background
 *  - selected: strong accent background
 *  - sameValueAsSelected: subtle highlight to call out duplicate digits
 *  - isPeer: muted background (row/col/block of the selected cell)
 *
 * Memoized on the props to avoid re-rendering all 81 cells on every state change.
 */
function CellInner({
  cell,
  original,
  size,
  selected,
  isPeer,
  sameValueAsSelected,
  hasError,
  thickRightBorder,
  thickBottomBorder,
  onPress,
}: CellProps) {
  const { theme } = useTheme()
  const status = cellStatus(cell, original)

  const bg = pickBackground(theme, { hasError, selected, sameValueAsSelected, isPeer })
  const fg = pickForeground(theme, status)

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderRightWidth: thickRightBorder ? 2 : StyleSheet.hairlineWidth,
        borderBottomWidth: thickBottomBorder ? 2 : StyleSheet.hairlineWidth,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="button"
      accessibilityLabel={
        cell.value !== 0 ? `Cell ${cell.value}` : `Empty cell, candidates ${cell.candidates.join(' ')}`
      }
      accessibilityState={{ selected }}
    >
      {cell.value !== 0 ? (
        <Text
          style={{
            color: fg,
            fontSize: Math.floor(size * 0.55),
            fontWeight: status === 'prefilled' ? '700' : '500',
          }}
        >
          {cell.value}
        </Text>
      ) : cell.candidates.length > 0 ? (
        <Candidates candidates={cell.candidates} size={size} color={theme.colors.mutedForeground} />
      ) : null}
    </Pressable>
  )
}

function Candidates({
  candidates,
  size,
  color,
}: {
  candidates: number[]
  size: number
  color: string
}) {
  const present = new Set(candidates)
  const fontSize = Math.max(8, Math.floor(size * 0.22))
  return (
    <View
      style={{
        width: size - 2,
        height: size - 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
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
          <Text style={{ color, fontSize, fontVariant: ['tabular-nums'] }}>
            {present.has(n) ? n : ''}
          </Text>
        </View>
      ))}
    </View>
  )
}

function pickBackground(
  theme: Theme,
  flags: { hasError: boolean; selected: boolean; sameValueAsSelected: boolean; isPeer: boolean },
): string {
  const c = theme.colors
  if (flags.hasError) return c.cellError
  if (flags.selected) return c.cellSelected
  if (flags.sameValueAsSelected) return c.accent
  if (flags.isPeer) return c.cellHighlight
  return c.card
}

function pickForeground(theme: Theme, status: 'prefilled' | 'edited' | 'blank'): string {
  if (status === 'prefilled') return theme.colors.cellPrefilled
  if (status === 'edited') return theme.colors.cellEdited
  return theme.colors.foreground
}

export const Cell = memo(CellInner)
