<script setup lang="ts">
import type { Cell } from '@/stores/models/cell';
const props = defineProps<{
  cell: Cell,
  width: number,
  highlighted: boolean
}>();
</script>

<template>
  <div :class="[{ 'bg-orange-400': highlighted }, `w-[${props.width}px] h-[${props.width}px]`]">
    <div v-if="cell.value !== undefined">{{ cell.value }}</div>

  </div>
</template>
