import { NextFunction, Request, Response } from 'express'
import * as z from 'zod/v4'
import { ValidationError } from '../../../core/errors/validationError';
import { cellSchema } from '../models/cell';
import { difficultySchema } from '../models/difficulty';
import { objectIdSchema } from '../models/objectId';

const getPuzzleSchema = z.object({
    puzzleId: objectIdSchema
})
const createPuzzleSchema = z.object({
    cells: z.array(cellSchema, 'Invalid cell array'),
    difficulty: difficultySchema,
    usedBy: z.array(objectIdSchema, 'Invalid usedBy array')

})
export const getPuzzleValidator = (req: Request<{puzzleId: string}>, res: Response, next: NextFunction) => {
    const validationResult = getPuzzleSchema.safeParse(req.params);
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error)
    }
    next()
}
export const createPuzzleValidator = (req: Request, res: Response, next: NextFunction) => {
    const validationResult = createPuzzleSchema.safeParse(req.body)
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error)
    }
    next()
}