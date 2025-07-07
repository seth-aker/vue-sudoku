<script setup lang='ts'>
import SudokuControls from '@/components/SudokuControls.vue';
import SudokuPuzzle from '@/components/SudokuPuzzle.vue';
import useSudokuStore from '@/stores/sudokuStore'

const sudokuStore = useSudokuStore();

sudokuStore.getNewPuzzle({ difficulty: 'easy' });

const handleNumPress = (event: KeyboardEvent) => {
  console.log(`KeyPress registered: ${event.key}`)
  if (sudokuStore.selectedCell.x === undefined || sudokuStore.selectedCell.y === undefined) return;
  for (let i = 0; i < sudokuStore.puzzle.cellsPerRow; i++) {
    if (`${i + 1}` === event.key) {
      const cell = sudokuStore.getCell(sudokuStore.selectedCell.x, sudokuStore.selectedCell.y);
      if (!cell) return;
      cell.value = (i + 1)
      sudokuStore.setCell(cell, sudokuStore.selectedCell.x, sudokuStore.selectedCell.y)
      break;
    }
  }

}
</script>

<template>
  <div v-on:keypress="(event) => handleNumPress(event)" class="w-screen h-screen flex items-center justify-center">
    <SudokuPuzzle v-if="sudokuStore.puzzle" :puzzle="sudokuStore.puzzle"
      v-model:selected-cell="sudokuStore.selectedCell" />
    <SudokuControls />
  </div>
  <div>
    {{ sudokuStore.isPuzzleSolved ? 'Puzzle solved' : 'Puzzle unsolved' }}
  </div>
</template>
