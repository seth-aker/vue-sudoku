import type { Cell } from "@/stores/models/cell"

export interface Action {
  prevCell: Cell | undefined,
  x: number,
  y: number
}
