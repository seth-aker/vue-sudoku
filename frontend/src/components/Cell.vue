<script setup lang="ts">
import type { Cell } from '@/stores/models/cell';
import useSudokuStore from '@/stores/sudoku'
import { computed } from 'vue';
const props = defineProps<{
  cell: Cell,
  width: number,
  highlighted: boolean,
  selected: boolean,
}>();
const sudokuStore = useSudokuStore()
const visiblePencilArray = computed(() => {
  return new Array(sudokuStore.puzzle?.cellsPerRow).map((each, index) => {
    return props.cell.pencilValues.includes(index);
  })
})

</script>

<template>
  <div
    :class="['outline-1 outline-gray-300', { 'bg-orange-200': highlighted }, { 'bg-orange-400': selected }, { 'bg-white': !highlighted && !selected }]"
    :style="{ height: `${width}px`, width: `${width}px` }" class="absolute">
    <div v-if="cell.value !== undefined" class="relative h-full w-full flex items-center justify-center"
      :class="[{ 'font-bold': cell.type === 'original' }]">
      {{ cell.value }}</div>
    <div v-else class="relative h-full w-full flex flex-wrap">
      <div v-for="(isVisable, index) in visiblePencilArray"
        :style="{ width: `${100 / Math.sqrt(visiblePencilArray.length)}%`, height: `${100 / Math.sqrt(visiblePencilArray.length)}%` }">
        <span v-show="isVisable" class="font-light">{{ index }}</span>
      </div>
    </div>
  </div>
</template>
