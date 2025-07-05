<script setup lang='ts'>
import SudokuPuzzle from '@/components/SudokuPuzzle.vue';
import useSudokuStore from '@/stores/sudoku'

const sudokuStore = useSudokuStore();

sudokuStore.getNewPuzzle({ difficulty: 'easy' });

</script>

<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <SudokuPuzzle v-if="sudokuStore.puzzle" :puzzle="sudokuStore.puzzle"
      v-model:selected-cell="sudokuStore.selectedCell" />
  </div>
</template>
