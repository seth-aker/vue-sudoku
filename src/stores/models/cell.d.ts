export interface Cell {
    type: 'pre-filled' | 'input',
    value: number | undefined,
    pencilValues: number[]
}