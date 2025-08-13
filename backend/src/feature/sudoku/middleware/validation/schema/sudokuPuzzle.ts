import z from "zod/v4"
import { objectIdSchema } from "../../../../../core/validation/objectId.ts"
import { cellSchema } from "./cell.ts"
import { difficultySchema } from "./difficulty.ts"

export const getPuzzleByIdSchema = z.object({
    puzzleId: objectIdSchema
})
export const getPuzzleSchema = z.optional(z.object({
    difficulty: difficultySchema
}))
export const createPuzzleSchema = z.object({
    cells: z.array(z.array(cellSchema, 'Invalid cell array'), 'Invalid row array'),
    difficulty: difficultySchema,
})
export const updatePuzzleSchema = z.object({
    cells: z.optional(z.array(z.array(cellSchema, 'Invalid cell array'), 'Invalid row array')),
    difficulty: z.optional(difficultySchema),
    solved: z.optional(z.boolean())
})

export const deletePuzzleSchema = z.object({
  puzzleId: objectIdSchema
})
