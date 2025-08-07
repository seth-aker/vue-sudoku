import mongoose from "mongoose";

export interface Cell {
    cellId: string;
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    candidates: Set<number>,
}
export const cellSchema = new mongoose.Schema<Cell>({
    cellId: String,
    type: {
        type: String,
        enum: ['prefilled', 'edited', 'blank'],
        default: 'blank'
    },
    value: Number,
    candidates: {
       type: [Number],
       default: new Set<number>()
    }
})