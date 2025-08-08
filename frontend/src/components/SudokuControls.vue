<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from './ui/button';
import Toggle from './ui/toggle/Toggle.vue';
import { useSudokuStore } from '@/stores/sudokuStore'
import Numpad from './Numpad.vue';
const sudokuStore = useSudokuStore()
const eraseValue = () => {
  const { x, y } = sudokuStore.selectedCell;
  if (x === undefined || y === undefined) {
    return;
  }
  const cell = sudokuStore.getCell(x, y)
  if (!cell) {
    console.error(`Cell at ${x}, ${y} could not be found.`)
    return;
  }
  if (cell.value === undefined) {
    cell.candidates = [];
  }
  cell.value = undefined;
  sudokuStore.setCell(cell, x, y)
}

</script>

<template>
  <div>
    <div class="flex items-center">
      <Button @click="() => sudokuStore.undoAction()">
        <Icon icon="material-symbols:undo-rounded" />
      </Button>
      <Button @click="eraseValue">
        <Icon icon="material-symbols:ink-eraser-outline-rounded" />
      </Button>
      <Toggle @update:model-value="sudokuStore.usingPencil = !sudokuStore.usingPencil"
        :model-value="sudokuStore.usingPencil">
        <Icon icon="material-symbols:edit-outline-rounded" />
      </Toggle>
    </div>
    <div>
      <Numpad />
    </div>
  </div>
</template>
