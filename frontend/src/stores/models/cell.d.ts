export interface Cell {
    type: 'original' | 'added',
    value: number | undefined,
    pencilValues: number[],
    // row: number | undefined,
    // column: number | undefined,
    // block: number | undefined
}
