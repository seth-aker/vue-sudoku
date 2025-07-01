export interface Cell {
    type: 'pre-filled' | 'input',
    value: number | undefined,
    pencilValues: number[],
    // row: number | undefined,
    // column: number | undefined,
    // block: number | undefined
}