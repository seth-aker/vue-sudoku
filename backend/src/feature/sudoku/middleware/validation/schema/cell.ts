import z from "zod/v4";

export const cellSchema = z.object({
    cellId: z.string(),
    type: z.enum(['prefilled', 'edited', 'blank'], "Invalid cell type"),
    value: z.optional(z.number('Cell value must be a number')),
    candidates: z.array(z.number('Candidate value must be a number'), 'Invalid candidates set')
})
