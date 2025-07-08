<script setup lang='ts'>
import SudokuControls from '@/components/SudokuControls.vue';
import SudokuPuzzle from '@/components/SudokuPuzzle.vue';
import useSudokuStore from '@/stores/sudokuStore'
import useGameStore from '@/stores/gameStore'
import { Dialog } from '@/components/ui/dialog';
import { onMounted, onUnmounted, ref, watch } from 'vue'
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
const sudokuStore = useSudokuStore();
const gameStore = useGameStore()
const router = useRouter();
const difficulty = router.currentRoute.value.name?.toString() as Difficulty

sudokuStore.getNewPuzzle({ difficulty: difficulty });

onMounted(() => {
  window.addEventListener('keyup', handleKeyPress);
  gameStore.startTimer();
  gameStore.gameState = 'playing'
})
onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyPress)
  gameStore.stopTimer();
  gameStore.gameState = 'not-started'
})

const dialogOpen = ref(false);
watch(() => sudokuStore.isPuzzleSolved, () => {
  if (sudokuStore.isPuzzleSolved) {
    gameStore.stopTimer();
    dialogOpen.value = true;
    gameStore.gameState = 'solved';
  }
})

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
        cell.pencilValues = [];
        cell.value = undefined
      } else {
        cell.value = undefined;
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
          if (!cell) return;
          if (sudokuStore.usingPencil) {
            cell.pencilValues.includes(i + 1) ? cell.pencilValues = cell.pencilValues.filter((value) => value !== i + 1) : cell.pencilValues.push(i + 1)
          } else {
            cell.value = (i + 1)
          }
          sudokuStore.setCell(cell, sudokuStore.selectedCell.x, sudokuStore.selectedCell.y)
          break;
        }
      }
  }
}
</script>

<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <SudokuPuzzle v-if="sudokuStore.puzzle" :puzzle="sudokuStore.puzzle"
      v-model:selected-cell="sudokuStore.selectedCell" />
    <div>
      {{ gameStore.formattedElapsedTime }}
      <Button @click="toggleTimer" variant="ghost">
        <Icon v-if="gameStore.gameState === 'playing'" icon="material-symbols:pause-rounded" />
        <Icon v-else icon="material-symbols:play-arrow-rounded" />
      </Button>
    </div>
    <SudokuControls />
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
          <Button @click="() => { sudokuStore.getNewPuzzle({ difficulty: difficulty }); dialogOpen = false }">
            New Puzzle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
