<script setup lang='ts'>
import useSudokuStore from '@/stores/sudoku'

const sudokuStore = useSudokuStore();

sudokuStore.getNewPuzzle({ difficulty: 'easy' });

</script>
<template>

</template>
