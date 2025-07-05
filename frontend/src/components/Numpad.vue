<script setup lang="ts">
import useSudokuStore from '@/stores/sudokuStore';
import { Button } from './ui/button';
const sudokuStore = useSudokuStore();

const inputs = [] as number[];
for (let i = 0; i < sudokuStore.puzzle.cellsPerRow; i++) {
  inputs.push(i + 1);
}
const onNumberPress = (value: number) => {
  const { x, y } = sudokuStore.selectedCell
  const cell = sudokuStore.getCell(x, y);
  if (x === undefined || y === undefined || cell === undefined || cell.type === 'prefilled') {
    return;
  }
  if (sudokuStore.usingPencil) {
    // Edit pencilValues
    if (cell.pencilValues.includes(value)) {
      cell.pencilValues = cell.pencilValues.filter((pencilValue) => pencilValue !== value);
    } else {
      cell.pencilValues.push(value);
    }
  } else {
    // edit cell value
    if (cell.value === undefined || cell.value !== value) {
      cell.value = value;
    } else {
      cell.value = undefined;
    }
  }
  cell.type = 'edited'
  sudokuStore.setCell(cell, x, y)
}
</script>

<template>
  <div class="grid"
    :style="{ gridTemplateColumns: `repeat(${Math.sqrt(sudokuStore.puzzle.cellsPerRow)}, minmax(0, 1fr))` }">
    <Button size="icon" v-for="(input) in inputs" @click="onNumberPress(input)">{{ input }}</Button>
  </div>
</template>
