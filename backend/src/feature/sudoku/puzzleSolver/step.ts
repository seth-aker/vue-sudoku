import { Strategies } from "./strategies";

export interface Step {
  rowIndex: number | undefined,
  colIndex: number | undefined,
  value: number | undefined,
  candidateRemoved: boolean;
  type?: Strategies,
}
