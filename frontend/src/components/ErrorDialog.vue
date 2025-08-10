<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogClose, DialogTitle, DialogFooter } from './ui/dialog';
const errorMessage = defineModel<null | string>();
</script>
<template>
  <Dialog :open="errorMessage !== null">
    <DialogContent>
      <DialogTitle>Oops!</DialogTitle>
      <DialogDescription>{{ errorMessage }}</DialogDescription>
      <DialogFooter>
        <DialogClose>Close</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
