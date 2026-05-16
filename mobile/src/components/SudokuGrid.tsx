import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { PEERS, idxOf, isPrefilled } from '@/src/domain';
import { useGameStore } from '@/src/store/gameStore';
import { useTheme } from '@/src/theme/ThemeProvider';

import { Cell } from './Cell';

export function SudokuGrid() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const cells = useGameStore((s) => s.cells);
  const originalCells = useGameStore((s) => s.originalCells);
  const selectedIdx = useGameStore((s) => s.selectedIdx);
  const conflicts = useGameStore((s) => s.conflicts);
  const selectCell = useGameStore((s) => s.selectCell);

  const cellSize = useMemo(
    () => Math.floor((Math.min(width - 24, 400) - 8) / 9),
    [width],
  );

  const highlighted = useMemo(
    () => (selectedIdx === undefined ? null : new Set(PEERS[selectedIdx])),
    [selectedIdx],
  );

  return (
    <View
      style={[styles.grid, { backgroundColor: theme.colors.gridLine }]}
      accessibilityLabel="Sudoku grid">
      {[0, 1, 2].map((blockRow) => (
        <View key={blockRow} style={styles.blockRow}>
          {[0, 1, 2].map((blockCol) => (
            <View
              key={blockCol}
              style={[
                styles.block,
                { backgroundColor: theme.colors.gridLine },
              ]}>
              {[0, 1, 2].map((r) => (
                <View key={r} style={styles.cellRow}>
                  {[0, 1, 2].map((c) => {
                    const x = blockCol * 3 + c;
                    const y = blockRow * 3 + r;
                    const idx = idxOf(x, y);
                    return (
                      <Cell
                        key={idx}
                        cell={cells[idx]}
                        size={cellSize}
                        prefilled={isPrefilled(originalCells, idx)}
                        selected={selectedIdx === idx}
                        highlighted={!!highlighted?.has(idx)}
                        hasError={conflicts.has(idx)}
                        onPress={() => selectCell(idx)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { padding: 2, alignSelf: 'center' },
  blockRow: { flexDirection: 'row' },
  block: { margin: 1 },
  cellRow: { flexDirection: 'row' },
});
