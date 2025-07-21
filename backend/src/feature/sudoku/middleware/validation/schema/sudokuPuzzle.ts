import z from "zod/v4"
import { objectIdSchema } from "./objectId.ts"
import { cellSchema } from "./cell.ts"
import { difficultySchema } from "./difficulty.ts"

export const getPuzzleSchema = z.object({
    puzzleId: objectIdSchema
})
export const createPuzzleSchema = z.object({
    cells: z.array(z.array(cellSchema, 'Invalid cell array'), 'Invalid row array'),
    difficulty: difficultySchema,
    usedBy: z.array(objectIdSchema, 'Invalid usedBy array')
})
export const updatePuzzleSchema = z.object({
    cells: z.optional(z.array(z.array(cellSchema, 'Invalid cell array'), 'Invalid row array')),
    difficulty: z.optional(difficultySchema),
    usedBy: z.optional(z.array(objectIdSchema, 'Invalid usedBy array'))
})

export const deletePuzzleSchema = z.object({
  puzzleId: objectIdSchema
})
