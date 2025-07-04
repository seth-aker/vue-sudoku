<script setup lang="ts">
import Cell from './Cell.vue';
import { SudokuPuzzle } from '@/stores/models/puzzle';
const { puzzle } = defineProps<{
  puzzle: SudokuPuzzle
}>();
const blockLength = Math.sqrt(puzzle?.cellsPerRow ?? 0)
const blockGapPx = 3;
const cellHeightWidth = 40;
const puzzleHeightWidth = (cellHeightWidth * puzzle?.cellsPerRow!) + ((blockLength - 1) * blockGapPx)

const generateBlockSpacingOffset = (cellIndex: number) => {
  const offset = (cellHeightWidth * cellIndex) + (Math.floor(cellIndex / blockLength) * blockGapPx);
  return `${offset}px`
}
</script>

<template>
  <div class="relative bg-black flex items-center justify-center"
    :style="{ height: `${puzzleHeightWidth + blockGapPx * 2}px`, width: `${puzzleHeightWidth + blockGapPx * 2}px` }">
    <div class="relative bg-gray-500" :style="{ height: `${puzzleHeightWidth}px`, width: `${puzzleHeightWidth}px` }">
      <div v-for="(row, index) in puzzle?.rows" :key="`row${index}`" class="absolute w-full"
        :style="{ top: generateBlockSpacingOffset(index), height: `${cellHeightWidth}px` }">
        <div class="relative h-full w-full">
          <Cell v-for="(cell, index) in row" :key="`cell${index}`" :style="{ left: generateBlockSpacingOffset(index) }"
            class="absolute" :cell="cell" :width="cellHeightWidth" :highlighted="false" :selected="false" />
        </div>
      </div>
    </div>
  </div>
</template>
