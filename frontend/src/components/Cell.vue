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
  <div :class="[{ 'bg-orange-400': highlighted }, { 'bg-orange-600': selected }, `w-[${width}px] h-[${width}px]`]"
    class="absolute">
    <div v-if="cell.value !== undefined" class="relative h-full w-full"
      :class="[{ 'font-bold': cell.type === 'original' }]">
      {{ cell.value }}</div>
    <div v-else class="relative h-full w-full flex flex-wrap">
      <div v-for="(isVisable, index) in visiblePencilArray"
        :class="[`w-1/${Math.sqrt(visiblePencilArray.length)} h-1/${Math.sqrt(visiblePencilArray.length)}`]">
        <span v-show="isVisable" class="font-light">{{ index }}</span>
      </div>
    </div>
  </div>
</template>
