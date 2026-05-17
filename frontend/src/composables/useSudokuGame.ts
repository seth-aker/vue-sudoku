import { useGameStore } from "@/stores/_gameStore";
import { cloneCell, getPeers } from "@/utils/puzzleUtils";
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
    const prevCell = cloneCell(gameStore.cells[idx])
    gameStore.history.push({
      cell: prevCell,
      isParent: true
    })
    gameStore.redoActions = []
    gameStore.cells[idx].value = value;
    if(prevCell.value === 0 && value === 0) {
      const peers = getPeers(gameStore.cells, idx);
      peers.forEach((cell) => {
        if(cell.idx !== idx && cell.candidates.includes(value)) {
          gameStore.history.push({
            cell: cloneCell(cell),
            isParent: false
          })
          cell.candidates = cell.candidates.filter((candidate) => candidate !== value)
        }
      })
    }
  }

  function clearCell(idx: number) {
    if(gameStore.originalCells[idx].value !== 0) {
      return;
    }
    const prevCell = cloneCell(gameStore.cells[idx])
    gameStore.history.push({
      cell: prevCell,
      isParent: true
    })
    gameStore.redoActions = []
    if(gameStore.usingPencil) {
      gameStore.cells[idx].candidates = []
    } else {
      gameStore.cells[idx].value = 0
    }
  }


  function toggleCandidate(value: number, idx: number) {
    if(gameStore.originalCells[idx].value !== 0) {
      return;
    }
    const prevCell = cloneCell(gameStore.cells[idx])
    gameStore.history.push({
      cell: prevCell,
      isParent: true
    })
    gameStore.redoActions = []
    const cell = gameStore.cells[idx];
    if(prevCell.candidates.includes(value)) {
      cell.candidates.push(value)
    } else {
      cell.candidates = cell.candidates.filter(c => c !== value)
    }
  }

  function undo() {
    let action = gameStore.history.pop()
    while(action && !action.isParent) {
      const prevCell = cloneCell(gameStore.cells[action.cell.idx])
      gameStore.redoActions.push({
        cell: prevCell,
        isParent: false
      })
      gameStore.cells[action.cell.idx] = action.cell
      action = gameStore.history.pop()
    }
    if(action) {
      const prevCell = cloneCell(gameStore.cells[action.cell.idx])
      gameStore.redoActions.push({
        cell: prevCell,
        isParent: true
      })
      gameStore.cells[action.cell.idx] = action.cell;
      gameStore.selectedIdx = action.cell.idx;
    }
  }
  function redo() {
    let action = gameStore.redoActions.pop()
    if(action) {
      const prevCell = cloneCell(gameStore.cells[action.cell.idx])
      gameStore.cells[action.cell.idx] = prevCell;
      gameStore.history.push({
        cell: prevCell,
        isParent: true
      })
      gameStore.selectedIdx = action.cell.idx;
      action = gameStore.redoActions.pop()
    }
    while(action && !action.isParent) {
      const prevCell = cloneCell(gameStore.cells[action.cell.idx])
      gameStore.cells[action.cell.idx] = prevCell;
      gameStore.history.push({
        cell: prevCell,
        isParent: true
      })
      gameStore.selectedIdx = action.cell.idx;
      action = gameStore.redoActions.pop()
    }
    if(action) {
      gameStore.redoActions.push(action)
    }
  }
  function fillCandidates() {
    for(let i = 0; i < 81; i++) {
      if(gameStore.cells[i].value !== 0) {
        continue
      }
      for(let c = 1; c <= 9; c++) {
        const peers = getPeers(gameStore.cells, i);
        if(!peers.some(cell => cell.value === c) && !gameStore.cells[i].candidates.includes(c)) {
          gameStore.cells[i].candidates.push(c);
        }
      }
    }
  }

  function clearCandidates() {
    gameStore.cells.forEach(cell => cell.candidates = [])
  }

  function setAutoCandidateMode(on: boolean) {
    gameStore.autoCandidateMode = on;
    if(on) {
      fillCandidates()
    } else {
      clearCandidates()
    }
  }

  return {
    selectCell,
    togglePencil,
    placeValue,
    clearCell,
    toggleCandidate,
    undo,
    redo,
    fillCandidates,
    clearCandidates,
    setAutoCandidateMode
  }

}
