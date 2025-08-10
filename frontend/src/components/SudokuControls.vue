<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from './ui/button';
import Toggle from './ui/toggle/Toggle.vue';
import { useSudokuStore } from '@/stores/sudokuStore'
import Numpad from './Numpad.vue';
import Checkbox from './ui/checkbox/Checkbox.vue';
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
  if (cell.value === null) {
    cell.candidates = [];
  }
  cell.value = null;
  sudokuStore.setCell(cell, x, y)
}


const handleCheckboxChange = (isChecked: boolean | string) => {
  if (typeof isChecked === 'string') return;
  sudokuStore.autoCandidateMode = isChecked;
  if (sudokuStore.autoCandidateMode) {
    sudokuStore.fillPuzzleCandidates();
  } else {
    sudokuStore.clearPuzzleCandidates();
  }
}

</script>

<template>
  <div class="flex flex-col items-center mx-4">
    <div>
      <Button @click="() => sudokuStore.undoAction()" class="mx-0.5">
        <Icon icon="material-symbols:undo-rounded" />
      </Button>
      <Button @click="eraseValue" class="mx-0.5">
        <Icon icon="material-symbols:ink-eraser-outline-rounded" />
      </Button>
      <Toggle @update:model-value="sudokuStore.usingPencil = !sudokuStore.usingPencil" class="mx-0.5"
        :model-value="sudokuStore.usingPencil">
        <Icon icon="material-symbols:edit-outline-rounded" />
      </Toggle>
    </div>
    <div class="mx-4 my-2">
      <Numpad />
    </div>
    <div class="flex items-center justify-center">
      <Checkbox id="auto-candidate" :model-value="sudokuStore.autoCandidateMode"
        @update:model-value="handleCheckboxChange" />
      <label for="auto-candidate" class="text-xs ml-1">
        Auto-fill candidates
      </label>
    </div>
  </div>
</template>
