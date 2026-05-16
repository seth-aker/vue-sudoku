import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Cell as CellModel } from '@/src/domain';
import { useTheme } from '@/src/theme/ThemeProvider';

interface Props {
  cell: CellModel;
  size: number;
  prefilled: boolean;
  selected: boolean;
  highlighted: boolean;
  hasError: boolean;
  onPress: () => void;
}

function CellComponent({
  cell,
  size,
  prefilled,
  selected,
  highlighted,
  hasError,
  onPress,
}: Props) {
  const { theme } = useTheme();

  const bg = selected
    ? theme.colors.cellSelected
    : highlighted
      ? theme.colors.cellHighlighted
      : theme.colors.cellBackground;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        cell.value
          ? `Cell ${cell.idx}, value ${cell.value}${prefilled ? ', given' : ''}`
          : `Cell ${cell.idx}, empty`
      }
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderColor: theme.colors.border,
        },
      ]}>
      {cell.value !== 0 ? (
        <Text
          style={[
            styles.value,
            {
              fontSize: size * 0.55,
              color: hasError ? theme.colors.cellError : theme.colors.cellText,
              fontWeight: prefilled ? 'bold' : '400',
            },
          ]}>
          {cell.value}
        </Text>
      ) : (
        <View style={styles.candidates}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <View key={n} style={styles.candidateCell}>
              <Text
                style={[
                  styles.candidateText,
                  {
                    fontSize: size * 0.2,
                    color: theme.colors.cellText,
                    opacity: cell.candidates.includes(n) ? 1 : 0,
                  },
                ]}>
                {n}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export const Cell = React.memo(CellComponent);

const styles = StyleSheet.create({
  cell: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { textAlign: 'center' },
  candidates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  candidateCell: {
    width: '33.33%',
    height: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateText: { fontWeight: '300' },
});
