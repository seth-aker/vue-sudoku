import type { Cell } from "@/stores/models/cell"

export interface Action {
  cell: Cell,
  x: number,
  y: number
}
