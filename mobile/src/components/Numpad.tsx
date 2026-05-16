import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useGameStore } from '@/src/store/gameStore';

import { Button } from '@/src/ui';

export function Numpad() {
  const cells = useGameStore((s) => s.cells);
  const gameState = useGameStore((s) => s.gameState);
  const inputNumber = useGameStore((s) => s.inputNumber);

  // §7.5 fix: count actual occurrences of each digit (the web app counted
  // rows containing the digit, so the "fully placed" disable was wrong).
  const counts = useMemo(() => {
    const c = new Array(10).fill(0);
    for (const cell of cells) if (cell.value) c[cell.value]++;
    return c;
  }, [cells]);

  const paused = gameState === 'paused';

  return (
    <View style={styles.pad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <Button
          key={n}
          title={String(n)}
          size="md"
          style={styles.key}
          disabled={paused || counts[n] >= 9}
          onPress={() => inputNumber(n)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 240,
    alignSelf: 'center',
    gap: 6,
  },
  key: { width: 68 },
});
