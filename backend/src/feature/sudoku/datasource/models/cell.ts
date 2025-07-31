export interface Cell {
    cellId: string;
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    candidates: Set<number>,
}
