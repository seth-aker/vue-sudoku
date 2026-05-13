import { useGameStore } from "@/stores/_gameStore";
import { cloneDeep } from "lodash";
export function useSudokuGame() {
  const gameStore = useGameStore()
  function selectCell(idx: number) {
    gameStore.selectedIdx = idx;
  }
  function togglePencil() {
    gameStore.usingPencil = !gameStore.usingPencil
  }
  function placeValue(value: number, idx: number) {
    if(value < 0 || value > 9 || idx < 0 || idx > 81) {
      return;
    }
    if(gameStore.originalCells[idx].value !== 0) {
      return;
    }
    const prevCell = cloneDeep(gameStore.cells[idx])
    gameStore.actions.push({
      prevCell,
      idx: prevCell.idx,
      isParent: true
    })
    gameStore.redoActions = []
    gameStore.cells[idx].value = value;
    if(prevCell.value === 0 && value === 0) {
      
    }

  }
}
