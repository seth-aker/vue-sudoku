<script setup lang='ts'>
import SudokuControls from '@/components/SudokuControls.vue';
import SudokuPuzzle from '@/components/SudokuPuzzle.vue';
import useSudokuStore from '@/stores/sudokuStore'
import { Dialog } from '@/components/ui/dialog';
import { onMounted, onUnmounted, ref, watch } from 'vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue';
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue';
import Button from '@/components/ui/button/Button.vue';
import DialogClose from '@/components/ui/dialog/DialogClose.vue';

const sudokuStore = useSudokuStore();

sudokuStore.getNewPuzzle({ difficulty: 'easy' });

onMounted(() => {
  window.addEventListener('keyup', handleKeyPress)
})
onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyPress)
})

const dialogOpen = ref(false);
watch(() => sudokuStore.isPuzzleSolved, () => {
  if (sudokuStore.isPuzzleSolved) {
    dialogOpen.value = true;
  }
})

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

        <DialogFooter>
          <DialogClose as-child>
            <Button variant="secondary" @click="dialogOpen = false">
              Close
            </Button>
          </DialogClose>
          <Button @click="() => { sudokuStore.getNewPuzzle({ difficulty: 'easy' }); dialogOpen = false }">
            New Puzzle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
