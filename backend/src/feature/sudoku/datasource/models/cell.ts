import { CandidateSet } from "./candidateSet";

export interface Cell {
    cellId: string;
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    candidates: CandidateSet,
}
