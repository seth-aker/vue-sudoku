import express, { NextFunction, Request, Response } from 'express';
import { SudokuService } from "../service/sudokuService.ts";
import { SudokuRequest } from './sudokuRequest.ts';
import { type PuzzleOptions} from '../datasource/models/puzzleOptions.ts';
import { DatabaseError } from '@/core/errors/databaseError.ts';
import { getPuzzleByIdValidator, getPuzzleValidator, updatePuzzleValidator } from '../middleware/validation/validation.ts';
import { requireLoggedin } from '@/feature/auth/middleware/validation.ts';
import { UpdatePuzzle } from '../datasource/models/sudokuPuzzle.ts';

export default function SudokuRouter(sudokuService: SudokuService) {
  const router = express.Router();
  // /api/sudoku
  router.get('/new', getPuzzleValidator, async (req: SudokuRequest, res: Response, next: NextFunction) => {
    const requestedBy = req.authUser?.id ?? req.session.user?.id;
    const puzzleOptions: PuzzleOptions = {
      difficulty: req.query.difficulty ?? 'easy'
    }
    try {
       const puzzle = await sudokuService.getNewPuzzle(requestedBy, puzzleOptions);
       res.json(puzzle)
    } catch (err) {
      next(err)
    }
  })

  router.get('/:puzzleId', requireLoggedin, getPuzzleByIdValidator, async (req: Request<{puzzleId: string}>, res: Response, next: NextFunction) => {
    try {
      const puzzleId = req.params.puzzleId;
      const userId = req.authUser!.id
      const puzzle = await sudokuService.getUserPuzzle(userId, puzzleId);
      res.json(puzzle);
    } catch (err) {
      next(err)
    }
  })

  router.put('/:puzzleId', requireLoggedin, updatePuzzleValidator, async (req: Request<{puzzleId: string}>, res: Response, next: NextFunction) => {
    try {
      const userId = req.authUser!.id
      // puzzleId comes from the URL path, not the body
      const updateUserPuzzleDto: UpdatePuzzle = {
        puzzleId: req.params.puzzleId,
        ...(req.body as Omit<UpdatePuzzle, 'puzzleId'>),
      }
      const result = await sudokuService.updateUserPuzzle(userId, updateUserPuzzleDto);
      if(result !== 1) {
        throw new DatabaseError(`Expected to update 1, instead updated: ${result}`)
      }
      res.status(204).send();
    } catch (err) {
      next(err)
    }
  })

  return router
}
