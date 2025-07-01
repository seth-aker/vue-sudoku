import { defineStore } from "pinia";
import type { Row } from "./models/row";

export type Rows = Map<number, Row>

export default defineStore('sudoku', {
    state: () => ({
        rows: undefined as Rows | undefined,
        usingPencil: false,
        
    })
})