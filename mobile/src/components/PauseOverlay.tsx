import { useMemo } from 'react';

import { EMPTY } from '@/src/domain';
import { formatElapsed, useGameStore } from '@/src/store/gameStore';
import { Button, Modal, ThemedText } from '@/src/ui';

export function PauseOverlay() {
  const paused = useGameStore((s) => s.gameState === 'paused');
  const elapsed = useGameStore((s) => s.elapsedSeconds);
  const cells = useGameStore((s) => s.cells);
  const startTimer = useGameStore((s) => s.startTimer);

  const progress = useMemo(() => {
    const filled = cells.filter((c) => c.value !== EMPTY).length;
    return Math.round((filled / 81) * 100);
  }, [cells]);

  return (
    <Modal
      visible={paused}
      dismissable={false}
      title="Game Paused"
      footer={<Button title="Resume" onPress={startTimer} />}>
      <ThemedText variant="body">Game Time: {formatElapsed(elapsed)}</ThemedText>
      <ThemedText variant="body">Progress: {progress}%</ThemedText>
    </Modal>
  );
}
