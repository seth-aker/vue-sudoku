import { defineStore } from "pinia";
import { computed, ref } from "vue";

interface Cell {
  idx: number;
  value: number,
  candidates: number[]
}
type DifficultyRating = 'beginner' | 'easy' | 'medium' | 'hard' | 'impossible'

interface Action {
  prevCell: Cell,
  idx: number
  isParent: boolean
}
type GameStatus = 'idle' | 'playing' | 'paused' | 'solved'

const HOUR = 60 * 60;
const MINUTE = 60;

export const useGameStore = defineStore('gameStore', () => {
  const state = ref<GameStatus>('idle')
  const elapsedSeconds = ref<number>(0);
  
  const puzzleId = ref<string>();
  const cells = ref<Cell[]>(createBlankCells());
  const originalCells = ref<Cell[]>(createBlankCells())
  const difficultyRating = ref<DifficultyRating>();
  const difficultyScore = ref<number>(0);

  const usingPencil = ref(false);
  const selectedIdx = ref<number>();

  const actions = ref<Action[]>([]);
  const redoActions = ref<Action[]>([])

  const autoCandidateMode = ref<boolean>(false);

  const formattedTime = computed(() => {
    const hours = Math.floor(elapsedSeconds.value / HOUR);
    const mins = Math.floor((elapsedSeconds.value % HOUR) / MINUTE);
    const secs = (elapsedSeconds.value % HOUR) % MINUTE;
    let timeString = '';
    if(hours > 0) {
        timeString += `${hours}:`
    }
    if(hours > 0 && mins < 10) {
        timeString += `0${mins}:`
    } else {
        timeString += `${mins}:`
    }
    if(secs < 10) {
        timeString += `0${secs}`
    } else {
        timeString += secs.toString()
    }
    return timeString
  })
  const isSolved = computed(() => isPuzzleSolved(cells.value))
  const progressPercent = computed(() => {
    let count = 0;
    cells.value.forEach(each => {
      if(each.value !== 0) {
        count++
      }
    })
    return Math.round((count / 81) * 100)
  })
  
  function $reset() {
    state.value = 'idle'
    elapsedSeconds.value = 0;
    puzzleId.value = undefined;
    cells.value = createBlankCells()
    originalCells.value = createBlankCells()
    difficultyRating.value = undefined
    difficultyScore.value = 0;
    usingPencil.value = false;
    selectedIdx.value = undefined
    actions.value = []
    redoActions.value = []
    autoCandidateMode.value = false
  }

  return {
    state,
    elapsedSeconds,
    puzzleId,
    cells,
    originalCells,
    difficultyRating,
    difficultyScore,
    usingPencil,
    selectedIdx,
    actions,
    redoActions,
    autoCandidateMode,
    formattedTime,
    isSolved,
    progressPercent,
    $reset
  }
})

function isPuzzleSolved(cells: Cell[]) {
  for(let i = 0; i < 81; i++) {
    if(cells[i].value === 0) {
      return false
    }
    if(cellHasError(cells, i)) {
      return false;
    }
  }
  return true;
}
function cellHasError(cells: Cell[], idx: number) {
  if(cells[idx].value === 0) return false;
  const peers = [
    ...getRow(cells, Math.floor(idx / 9)).filter(cell => cell.idx !== idx),
    ...getCol(cells, idx % 9).filter(cell => cell.idx !== idx),
    ...getBlock(cells, idxToBlock(idx)).filter(cell => cell.idx !== idx)
  ]

  return peers.some(each => each.value === cells[idx].value)
}

function getRow(cells: Cell[], rowIdx: number) {
  const row: Cell[] = [];
  const offset = rowIdx * 9;
  for(let i = 0; i < 9; i++) {
    row.push(cells[offset + i])
  } 
  return row;
}
function getCol(cells: Cell[], colIdx: number) {
  const col: Cell[] = []
  for(let i = 0; i < 9; i++) {
    col.push(cells[i * 9 + colIdx])
  }
  return col;
}
function getBlock(cells: Cell[], blockIdx: number) {
  const block: Cell[] = []
  for(let i = 0; i < 9; i++) {
    const rowOffset = Math.floor(blockIdx / 3) * 9;
    const colOffset = (blockIdx % 3) * 3
    const blockRowOffset = Math.floor(i / 3) * 9
    const blockCol = i % 3;
    const cellIdx = rowOffset + colOffset + blockRowOffset + blockCol
    block.push(cells[cellIdx])
  }
  return block
} 

function createBlankCells(): Cell[] {
  return new Array(81).map((_, idx) => ({value: 0, candidates: [], idx}))
}
function idxToBlock(idx: number) {
  const row = Math.floor(idx / 9)
  const col = idx % 9
  return (Math.floor(row / 3) * 3) + Math.floor(col / 3)
}
