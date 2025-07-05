export interface Cell {
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    pencilValues: number[],
}
