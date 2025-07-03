<script setup lang="ts">
import useSudokuStore from '@/stores/sudoku'
import Cell from './Cell.vue';
const sudokuStore = useSudokuStore()
const cellWidth = 40;
const generateCellOffset = (cellIndex: number) => {
  let offset = cellWidth * cellIndex;
  const blockLength = Math.sqrt(sudokuStore.puzzle?.cellsPerRow!);
  offset += Math.floor(cellIndex / blockLength) * 3
  return `left-[${offset}px]`
}
</script>

<template>
  <div>
    <div class="relative">
      <div v-for="(row, index) in sudokuStore.puzzle?.rows" :key="`row${index}`">
        <Cell v-for="(cell, index) in row" :key="`cell${index}`" :class="[generateCellOffset(index)]" :cell="cell"
          :width="cellWidth" :highlighted="false" :selected="false" />
      </div>

    </div>
  </div>
</template>
