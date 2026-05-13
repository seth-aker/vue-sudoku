import { useGameStore } from "@/stores/gameStore";
import { useIntervalFn, type Pausable } from "@vueuse/core";
import { computed, effectScope } from "vue";

let interval: Pausable | undefined;
export function useGameClock() {
  const gameStore = useGameStore()
  if(!interval) {
    effectScope(true).run(() => {
      interval = useIntervalFn(() => gameStore.elapsedSeconds++, 1000, {immediate: false})
    })
  }
  function start() {
    gameStore.gameState = 'playing'
    interval?.resume()
  }
  function pause() {
    gameStore.gameState = 'paused'
    interval?.pause()
  }
  function halt() {
    interval?.pause()
  }
  function reset() {
    gameStore.elapsedSeconds = 0;
    interval?.pause()
    gameStore.gameState = 'not-started'
  }
  const isRunning = computed(() => interval?.isActive ?? false)
  return {
    start,
    pause,
    halt,
    reset,
    isRunning
  }
}
