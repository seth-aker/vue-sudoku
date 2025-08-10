<script setup lang="ts">
import type { Cell } from '@/stores/models/cell';
import { useSudokuStore } from '@/stores/sudokuStore'
import { computed } from 'vue';
const props = defineProps<{
  cell: Cell,
  width: number,
  highlighted: boolean,
  selected: boolean,
  hasError: boolean
}>();
const sudokuStore = useSudokuStore()
const visablePencilArray = computed(() => {
  const isVisableArray: boolean[] = new Array(sudokuStore.puzzle.cellsPerRow).fill(false);
  return isVisableArray.map((isVisible, index) => {
    return props.cell.value !== null ? false : props.cell.candidates.includes(index + 1);
  })
})

</script>

<template>
  <div
    :class="['outline-1 outline-gray-300', { 'bg-orange-200': highlighted }, { 'bg-orange-400': selected }, { 'bg-white': !highlighted && !selected }]"
    :style="{ height: `${width}px`, width: `${width}px` }" class="absolute">
    <div v-if="cell.value !== null" class="relative h-full w-full flex items-center justify-center text-black"
      :class="[{ 'font-bold': cell.type === 'prefilled' }, { 'text-red-600': hasError }]">
      {{ cell.value }}</div>
    <div v-else class="relative h-full w-full flex flex-wrap">
      <div v-for="(isVisable, index) in visablePencilArray"
        :style="{ width: `${100 / Math.sqrt(visablePencilArray.length)}%`, height: `${100 / Math.sqrt(visablePencilArray.length)}%` }">
        <span v-show="isVisable" class="font-light text-2xs flex items-center justify-center">{{ index + 1 }}</span>
      </div>
    </div>
  </div>
</template>
