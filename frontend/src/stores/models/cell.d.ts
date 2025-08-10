export interface Cell {
    cellId: string;
    type: 'prefilled' | 'edited' | 'blank',
    value: number | null,
    candidates: number[],
}
