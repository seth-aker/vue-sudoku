<script setup lang='ts'>
import SudokuControls from '@/components/SudokuControls.vue';
import SudokuPuzzle from '@/components/SudokuPuzzle.vue';
import { useSudokuStore } from '@/stores/sudokuStore'
import { useGameStore } from '@/stores/gameStore'
import { Dialog } from '@/components/ui/dialog';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue';
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue';
import Button from '@/components/ui/button/Button.vue';
import DialogClose from '@/components/ui/dialog/DialogClose.vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import type { Difficulty } from '@/stores/models/difficulty';
import { useAuth0 } from '@auth0/auth0-vue';
import { useUserStore } from '@/stores/userStore';
const sudokuStore = useSudokuStore();
const gameStore = useGameStore()
const userStore = useUserStore();
const router = useRouter();
const error = ref<string | null>(null)
const difficulty = ref(router.currentRoute.value.name?.toString() as Difficulty)
const dialogOpen = ref(false);
const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0()

const loading = computed(() => {
  return isLoading || userStore.userLoading || sudokuStore.loading
})
watch(() => loading, () => {
  if(loading) {
    gameStore.stopTimer()
  } else {
    gameStore.startTimer();
  }
})
const requestNewPuzzle = async (newDifficulty: Difficulty) => {
  let token = undefined;
  if (isAuthenticated.value) {
    token = await getAccessTokenSilently();
  }
  await sudokuStore.getNewPuzzle({ difficulty: newDifficulty }, token);
  gameStore.elapsedSeconds = 0;
  gameStore.startTimer();
}

onMounted(async () => {
  window.addEventListener('keyup', handleKeyPress);
  if (!sudokuStore.retrieveLocalState() || sudokuStore.puzzle.options.difficulty !== difficulty.value) {
    try {
      await requestNewPuzzle(difficulty.value)
    } catch (err) {
      if (typeof err === 'string') {
        error.value = err
      } else if (typeof err === 'object' && err instanceof Error) {
        error.value = err.message
      }
    }
  }
})
onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyPress)
  gameStore.stopTimer();
  gameStore.gameState = 'not-started'
})

watch(() => sudokuStore.isPuzzleSolved, () => {
  if (sudokuStore.isPuzzleSolved) {
    handlePuzzleSolved()
  }
})
const handlePuzzleSolved = async () => {
  gameStore.stopTimer();
  dialogOpen.value = true;
  gameStore.gameState = 'solved';
  const token = await getAccessTokenSilently()
  userStore.updateUser(token);
}
const toggleTimer = () => {
  if (gameStore.gameState === 'not-started' || gameStore.gameState === 'paused') {
    gameStore.startTimer();
    gameStore.gameState = 'playing'
  } else {
    gameStore.stopTimer();
    gameStore.gameState = 'paused'
  }
}
const handleKeyPress = (event: KeyboardEvent) => {
  if (sudokuStore.selectedCell.x === undefined || sudokuStore.selectedCell.y === undefined) return;
  switch (event.key) {
    case 'ArrowUp':
      if (sudokuStore.selectedCell.y === 0) {
        sudokuStore.selectedCell.y = sudokuStore.puzzle.cellsPerRow - 1;
      } else {
        sudokuStore.selectedCell.y--;
      }
      break;
    case 'ArrowDown':
      if (sudokuStore.selectedCell.y === sudokuStore.puzzle.cellsPerRow - 1) {
        sudokuStore.selectedCell.y = 0;
      } else {
        sudokuStore.selectedCell.y++;
      }
      break;
    case 'ArrowLeft':
      if (sudokuStore.selectedCell.x === 0) {
        sudokuStore.selectedCell.x = sudokuStore.puzzle.cellsPerRow - 1;
      } else {
        sudokuStore.selectedCell.x--;
      }
      break;
    case 'ArrowRight':
      if (sudokuStore.selectedCell.x === sudokuStore.puzzle.cellsPerRow - 1) {
        sudokuStore.selectedCell.x = 0;
      } else {
        sudokuStore.selectedCell.x++
      }
      break;
    case 'Backspace':
      const cell = sudokuStore.getCell(sudokuStore.selectedCell.x, sudokuStore.selectedCell.y);
      if (!cell) return;
      if (sudokuStore.usingPencil) {
        cell.candidates = [];
        cell.value = null
      } else {
        cell.value = null;
      }
      sudokuStore.setCell(cell, sudokuStore.selectedCell.x, sudokuStore.selectedCell.y)
      break;
    case 'p':
    case 'P':
      sudokuStore.usingPencil = !sudokuStore.usingPencil
      break;
    default:
      for (let i = 0; i < sudokuStore.puzzle.cellsPerRow; i++) {
        if (`${i + 1}` === event.key) {
          const cell = sudokuStore.getCell(sudokuStore.selectedCell.x, sudokuStore.selectedCell.y);
          if (!cell || cell.type === 'prefilled') return;
          if (sudokuStore.usingPencil) {
            cell.candidates.includes(i + 1) ? cell.candidates = cell.candidates.filter((value) => value !== i + 1) : cell.candidates.push(i + 1)
          } else {
            cell.value = cell.value ? null : (i + 1)
          }
          sudokuStore.setCell(cell, sudokuStore.selectedCell.x, sudokuStore.selectedCell.y)
          break;
        }
      }
  }
}
const handleReset = () => {
  if (confirm('This action cannot be undone, are you sure you want to continue?')) {
    sudokuStore.resetPuzzle();
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="w-full flex items-center justify-center my-4">
      {{ difficulty.charAt(0).toUpperCase() + difficulty.substring(1) }}
      {{ gameStore.formattedElapsedTime }}
      <div class="mx-4">
        <Button @click="toggleTimer" variant="ghost">
          <Icon v-if="gameStore.gameState === 'playing'" icon="material-symbols:pause-rounded" />
          <Icon v-else icon="material-symbols:play-arrow-rounded" />
        </Button>
        <Button @click="handleReset">Reset</Button>
      </div>
    </div>

    <div class="flex">
      <SudokuPuzzle v-if="sudokuStore.puzzle" :puzzle="sudokuStore.puzzle"
        v-model:selected-cell="sudokuStore.selectedCell" />
      <SudokuControls />
    </div>
    <Dialog :open="dialogOpen" @update:open="(event) => dialogOpen = event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Puzzle Complete!
          </DialogTitle>
          <DialogDescription>
            You did it!
          </DialogDescription>
        </DialogHeader>
        Time: {{ gameStore.formattedElapsedTime }}
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="secondary" @click="dialogOpen = false">
              Close
            </Button>
          </DialogClose>
          <Button @click="() => { requestNewPuzzle(difficulty); dialogOpen = false }">
            New Puzzle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
