import { defineStore } from "pinia";
import type { Difficulty } from "./models/difficulty";
import type { GameState } from "./models/gameState";

const ONE_MINUTE_SECONDS = 60;
const ONE_HOUR_SECONDS = 60 * ONE_MINUTE_SECONDS;
export const useGameStore = defineStore('gameStore', {
    state: () => ({
        difficulty: undefined as Difficulty | undefined,
        elapsedSeconds: 0,
        gameState: 'not-started' as GameState,
        interval: null as NodeJS.Timeout | null
    }),
    actions: {
      startTimer() {
        if(this.interval) {
          clearInterval(this.interval)
        }
        this.interval = setInterval(() => {
          this.elapsedSeconds++
        }, 1000)
      },
      stopTimer() {
        if(this.interval) {
          clearInterval(this.interval)
        }
      }
    },
    getters: {
        formattedElapsedTime: (state) => {
            const hours = Math.floor(state.elapsedSeconds / ONE_HOUR_SECONDS);
            const mins = Math.floor((state.elapsedSeconds % ONE_HOUR_SECONDS) / ONE_MINUTE_SECONDS);
            const secs = (state.elapsedSeconds % ONE_HOUR_SECONDS) % ONE_MINUTE_SECONDS;
            let timeString = '';
            if(hours > 0) {
                timeString += `${hours}:`
            }
            if(hours > 0 && mins < 10) {
                timeString += `0${mins}:`
            } else {
                timeString += `${mins}:`
            }
            if(secs < 10) {
                timeString += `0${secs}`
            } else {
                timeString += secs.toString()
            }
            return timeString
        }
    }
})
