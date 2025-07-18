import z from "zod/v4";

export const cellSchema = z.object({
    cellId: z.string(),
    type: z.enum(['prefilled', 'edited', 'blank'], "Invalid cell type"),
    value: z.optional(z.number('Cell value must be a number')),
    pencilValues: z.array(z.number('Pencil value must be a number'), 'Invalid pencilValues array')
})
