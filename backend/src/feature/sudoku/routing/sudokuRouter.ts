import express, { NextFunction, Request, Response } from 'express';
import { SudokuService } from "../service/sudokuService.ts";
import { deletePuzzleValidator, getPuzzleByIdValidator, updatePuzzleValidator } from "../middleware/validation/validation.ts";
import { DatabaseError } from "../../../core/errors/databaseError.ts";
import { SudokuRequest } from './sudokuRequest.ts';
import { type PuzzleOptions} from '../datasource/models/puzzleOptions.ts';
import { parseAuthHeader } from '@/feature/users/utils/parseAuthHeader.ts';

export default function SudokuRouter(sudokuService: SudokuService) {
  const router = express.Router();
  // /api/sudoku
  router.get('/new', async (req: SudokuRequest, res: Response, next: NextFunction) => {
    const requestedBy = parseAuthHeader(req.headers.authorization)?.sub ?? '';
    const puzzleOptions: PuzzleOptions = {
      difficulty: req.query.difficulty ?? 'medium'
    }
    try {
       const puzzle = await sudokuService.getNewPuzzle(requestedBy, puzzleOptions);
       res.send(JSON.stringify(puzzle))
    } catch (err) {
      next(err)
    }
  })
  
  router.get('/:puzzleId', getPuzzleByIdValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzleId = req.params.puzzleId;
      const puzzle = await sudokuService.getPuzzleById("userId", puzzleId);
      res.send(puzzle);
    } catch (err) {
      next(err)
    }
  })
  // router.post('/', createPuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const puzzle = req.body;
  //     const result = await sudokuService.createPuzzle(puzzle);
  //     res.status(201).send(result);
  //   } catch (err) {
  //     next(err)
  //   }
  // })
  router.put('/:puzzleId', updatePuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzle = req.body;
      const result = await sudokuService.updatePuzzle(puzzle);
      if(result !== 1) {
        throw new DatabaseError(`Expected to update 1, instead updated: ${result}`)
      }
      res.status(204).send();
    } catch (err) {
      next(err)
    }
  })
  router.delete('/:puzzleId', deletePuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzleId = req.params.puzzleId;
      const result = await sudokuService.deletePuzzle(puzzleId);
      if(result !== 1) {
        throw new DatabaseError(`Expected to delete 1, instead deleted: ${result}`)
      }
      res.sendStatus(201)
    } catch (err) {
      next(err)
    }
  })


  return router
}


