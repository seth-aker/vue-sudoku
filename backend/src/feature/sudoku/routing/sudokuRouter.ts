import express, { NextFunction, Request, Response } from 'express';
import { SudokuService } from "../service/sudokuService.ts";
import { createPuzzleValidator, deletePuzzleValidator, getPuzzleValidator, updatePuzzleValidator } from "../middleware/validation/validation.ts";
import { DatabaseError } from "../../../core/errors/databaseError.ts";
export default function SudokuRouter(sudokuService: SudokuService) {
  const router = express.Router();
  // /api/sudoku
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {

  })
  
  router.get('/:puzzleId', getPuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzleId = req.params.puzzleId;
      const puzzle = await sudokuService.getPuzzleById("userId", puzzleId);
      res.send(puzzle);
    } catch (err) {
      next(err)
    }
  })
  router.post('/', createPuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzle = req.body;
      const result = await sudokuService.createPuzzle(puzzle);
      res.status(201).send(result);
    } catch (err) {
      next(err)
    }
  })
  router.put('/:puzzleId', updatePuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzle = req.body;
      const result = await sudokuService.updatePuzzle(puzzle);
      if(result !== 1) {
        throw new DatabaseError(new Error(`Expected to update 1, instead updated: ${result}`))
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
        throw new DatabaseError(new Error(`Expected to delete 1, instead deleted: ${result}`))
      }
      res.sendStatus(201)
    } catch (err) {
      next(err)
    }
  })


  return router
}


