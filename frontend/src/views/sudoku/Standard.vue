<script setup lang='ts'>
import SudokuControls from '@/components/SudokuControls.vue';
import ControlInstructions from '@/components/ControlInstructions.vue';
import SudokuPuzzle from '@/components/SudokuPuzzle.vue';
import { useSudokuStore } from '@/stores/sudokuStore'
import { useGameStore } from '@/stores/gameStore'
import { Dialog } from '@/components/ui/dialog';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue';
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue';
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue';
import Button from '@/components/ui/button/Button.vue';
import DialogClose from '@/components/ui/dialog/DialogClose.vue';
import { Icon } from '@iconify/vue';
import type { Difficulty } from '@/stores/models/difficulty';
import { useUserStore } from '@/stores/userStore';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import ErrorDialog from '@/components/ErrorDialog.vue';
import PauseMenu from '@/components/PauseMenu.vue';
import { useDocumentVisibility, watchDebounced } from '@vueuse/core';

const { difficulty } = defineProps<{ difficulty: Difficulty['rating'] }>()

const sudokuStore = useSudokuStore();
const gameStore = useGameStore()
const userStore = useUserStore();
const error = ref<string | null>(null)
const dialogOpen = ref(false);

const loading = computed(() => {
  return userStore.userLoading || sudokuStore.loading
})
watch(() => loading.value, () => {
  if (loading) {
    gameStore.stopTimer()
  } else {
    gameStore.startTimer();
  }
})
const requestNewPuzzle = async (newDifficulty: Difficulty['rating']) => {
  await sudokuStore.getNewPuzzle({ difficulty: { rating: newDifficulty } });
  gameStore.elapsedSeconds = 0;
}

onMounted(async () => {
  sudokuStore.$reset()
  if (!sudokuStore.retrieveLocalState() || sudokuStore.puzzle.options.difficulty.rating !== difficulty) {
    try {
      await requestNewPuzzle(difficulty)
      gameStore.startTimer();
    } catch (err) {
      if (typeof err === 'string') {
        error.value = err
      } else if (typeof err === 'object' && err instanceof Error) {
        error.value = err.message
      }
    }
  } else {
    // If sudokuStore.retrieveLocalState returns true, start game timer where it left off.
    gameStore.loadElapsedSecondsLocal()
    gameStore.startTimer()
  }
})
const docVis = useDocumentVisibility()
watch(() => docVis.value, () => {
  console.log('Doc Vis fired!')
  if (docVis.value === 'hidden' && userStore.isAuthenticated) {
    sudokuStore.saveGameState({ keepalive: true })
  }
})

watchDebounced(() => sudokuStore.actions.length, () => {
  sudokuStore.saveGameState()
}, { debounce: 5000 })

onUnmounted(() => {
  gameStore.stopTimer();
  gameStore.gameState = 'not-started'
  gameStore.elapsedSeconds = 0;
})

watch(() => sudokuStore.isPuzzleSolved, () => {
  if (sudokuStore.isPuzzleSolved) {
    handlePuzzleSolved()
  }
})
const handlePuzzleSolved = async () => {
  gameStore.stopTimer();
  dialogOpen.value = true;
  gameStore.gameState = 'solved';
  sudokuStore.saveGameState()
  // const token = await getAccessTokenSilently()
  // userStore.updateUser(token);
}
const toggleTimer = () => {
  if (gameStore.interval === null) {
    gameStore.startTimer();
  } else {
    gameStore.pauseGame()
  }
}

const handleReset = () => {
  if (confirm('This action cannot be undone, are you sure you want to continue?')) {
    sudokuStore.resetPuzzle();
  }
}
</script>

<template>
  <div class="flex flex-col h-full items-center justify-center">
    <div class="w-full flex items-center justify-center bg-gray-50 dark:bg-accent">
      {{ difficulty.charAt(0).toUpperCase() + difficulty.substring(1) }}
      {{ gameStore.formattedElapsedTime }}
      <div class="flex items-center my-2">
        <Button class="mx-2" @click="toggleTimer" variant="ghost">
          <Icon v-if="gameStore.interval" icon="material-symbols:pause-rounded" />
          <Icon v-else icon="material-symbols:play-arrow-rounded" />
        </Button>
        <ControlInstructions />
        <Button variant="ghost" class="mr-2 my-0 text-sm" @click="handleReset">Reset</Button>
      </div>
    </div>

    <div class="flex pt-4 flex-col justify-end h-full md:flex-row">
      <SudokuPuzzle v-if="sudokuStore.puzzle" :puzzle="sudokuStore.puzzle"
        v-model:selected-cell="sudokuStore.selectedCell" />
      <SudokuControls />
    </div>
    <Dialog :open="dialogOpen" @update:open="(event) => dialogOpen = event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Puzzle Complete!
          </DialogTitle>
          <DialogDescription>
            You did it!
          </DialogDescription>
        </DialogHeader>
        Time: {{ gameStore.formattedElapsedTime }}
        <DialogFooter class="gap-1">
          <DialogClose as-child>
            <Button variant="secondary" @click="dialogOpen = false">
              Close
            </Button>
          </DialogClose>
          <Button @click="() => { requestNewPuzzle(difficulty); dialogOpen = false }">
            New Puzzle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  <LoadingOverlay v-if="loading" />
  <ErrorDialog v-if="error" :message="error" />
  <PauseMenu />
</template>
