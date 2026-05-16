import { formatElapsed, useGameStore } from '@/src/store/gameStore';
import { Button, Modal, ThemedText } from '@/src/ui';

interface Props {
  onNewPuzzle: () => void;
}

export function CompletionModal({ onNewPuzzle }: Props) {
  const solved = useGameStore((s) => s.gameState === 'solved');
  const elapsed = useGameStore((s) => s.elapsedSeconds);
  const setState = useGameStore.setState;

  return (
    <Modal
      visible={solved}
      dismissable={false}
      title="Puzzle Complete!"
      description="You did it!"
      footer={
        <>
          <Button
            title="Close"
            variant="secondary"
            onPress={() => setState({ gameState: 'not-started' })}
          />
          <Button title="New Puzzle" onPress={onNewPuzzle} />
        </>
      }>
      <ThemedText variant="body">Time: {formatElapsed(elapsed)}</ThemedText>
    </Modal>
  );
}
