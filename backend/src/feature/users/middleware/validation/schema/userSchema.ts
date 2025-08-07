import { objectIdSchema } from '@/core/validation/objectId'
import { updatePuzzleSchema } from '@/feature/sudoku/middleware/validation/schema/sudokuPuzzle'
import z from 'zod/v4'

export const updateUserSchema = z.object({
    name: z.optional(z.string()),
    email: z.optional(z.email()),
    image: z.optional(z.string()),
    puzzlesPlayed: z.optional(z.array(objectIdSchema)),
    currentPuzzle: z.optional(updatePuzzleSchema)
})