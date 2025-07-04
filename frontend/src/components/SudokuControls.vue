<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from './ui/button';
import Toggle from './ui/toggle/Toggle.vue';
</script>

<template>
  <div>
    <div class="flex items-center">
      <Button>
        <Icon icon="material-symbols:undo-rounded" />
      </Button>
      <Button>
        <Icon icon="material-symbols:ink-eraser-outline-rounded" />
      </Button>
      <Toggle>
        <Icon icon="material-symbols:edit-outline-rounded" />
      </Toggle>
    </div>
  </div>
</template>
