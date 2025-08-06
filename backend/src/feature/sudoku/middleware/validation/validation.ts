import { NextFunction, Request, Response } from 'express'
import { ValidationError } from "../../../../core/errors/validationError.ts";
import { createPuzzleSchema, deletePuzzleSchema, getPuzzleByIdSchema, getPuzzleSchema, updatePuzzleSchema } from "./schema/sudokuPuzzle.ts";
import { SudokuRequest } from '../../routing/sudokuRequest.ts';

export const getPuzzleValidator = (req: SudokuRequest, res: Response, next: NextFunction) => {
    const validationResult = getPuzzleSchema.safeParse(req.query.difficulty);
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error);
    }
}
export const getPuzzleByIdValidator = (req: Request<{puzzleId: string}>, res: Response, next: NextFunction) => {
    const validationResult = getPuzzleByIdSchema.safeParse(req.params);
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error)
    }
    next();
}
export const createPuzzleValidator = (req: Request, res: Response, next: NextFunction) => {
    const validationResult = createPuzzleSchema.safeParse(req.body)
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error)
    }
    next();
}
export const updatePuzzleValidator = (req: Request, res: Response, next: NextFunction) => {
    const validationResult = updatePuzzleSchema.safeParse(req.body)
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error)
    }
    next();
}

export const deletePuzzleValidator = (req: Request, res: Response, next: NextFunction) => {
    const validationResult = deletePuzzleSchema.safeParse(req.params)
    if(!validationResult.success) {
        throw new ValidationError(validationResult.error)
    }
}
