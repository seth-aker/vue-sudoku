export interface Cell {
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    pencilValues: number[],
    // row: number | undefined,
    // column: number | undefined,
    // block: number | undefined
}
