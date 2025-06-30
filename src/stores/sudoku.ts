import { defineStore } from "pinia";

export default defineStore('sudoku', {
    state: () => ({
        cells: []
    })
})