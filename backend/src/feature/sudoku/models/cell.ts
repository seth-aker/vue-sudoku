import z from "zod/v4";

export interface Cell {
    cellId: string;
    type: 'prefilled' | 'edited' | 'blank',
    value: number | undefined,
    pencilValues: number[],
}

export const cellSchema = z.object({
    cellId: z.string(),
    type: z.enum(['prefilled', 'edited', 'blank'], "Invalid cell type"),
    value: z.optional(z.number('Cell value must be a number')),
    pencilValues: z.array(z.number('Pencil value must be a number'), 'Invalid pencilValues array')
})