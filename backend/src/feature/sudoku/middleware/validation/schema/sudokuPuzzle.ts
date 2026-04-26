import z from "zod/v4"
import { objectIdSchema } from "../../../../../core/validation/objectId.ts"
import { candidateStringSchema, cellSchema } from "./cell.ts"
import { difficultySchema } from "./difficulty.ts"

export const getPuzzleByIdSchema = z.object({
    puzzleId: objectIdSchema
})
export const getPuzzleSchema = z.optional(difficultySchema)

export const createPuzzleSchema = z.object({
    cells: z.array(z.array(cellSchema, 'Invalid cell array'), 'Invalid row array'),
    difficulty: difficultySchema,
})
export const updateUserPuzzleSchema = z.object({
    _id: z.uuid(),
    cells: z.string().refine((val) => val.length === 81, {message: 'Error, cell string must be 81 numbers long'}),
    candidates: candidateStringSchema,
    isCompleted: z.boolean(),
    time: z.number().positive('time must be a positive number')
})

export const deletePuzzleSchema = z.object({
  puzzleId: objectIdSchema
})
