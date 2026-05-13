import { useGameStore } from "@/stores/_gameStore";

export function useSudokuGame() {
  const gameStore = useGameStore()
  function selectCell(idx: number) {
    gameStore.selectedIdx = idx;
  }
}
