import z from "zod/v4"
import { objectIdSchema } from "./objectId"
import { cellSchema } from "./cell"
import { difficultySchema } from "./difficulty"

export const getPuzzleSchema = z.object({
    puzzleId: objectIdSchema
})
export const createPuzzleSchema = z.object({
    cells: z.array(cellSchema, 'Invalid cell array'),
    difficulty: difficultySchema,
    usedBy: z.array(objectIdSchema, 'Invalid usedBy array')
})
export const updatePuzzleSchema = z.object({
    cells: z.optional(z.array(cellSchema, 'Invalid cell array')),
    difficulty: z.optional(difficultySchema),
    usedBy: z.optional(z.array(objectIdSchema, 'Invalid usedBy array'))
})

export const deletePuzzleSchema = z.object({
  puzzleId: objectIdSchema
})
