export interface Cell {
    cellId: string;
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    pencilValues: number[],
}
