import express, { NextFunction, Request, Response } from 'express';
import { SudokuService } from '../service/sudokuService';
import { createPuzzleValidator, getPuzzleValidator } from '../middleware/validation';
export default function SudokuRouter(sudokuService: SudokuService) {
  const router = express.Router();
  // /api/sudoku
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {

  })
  router.get('/:puzzleId', getPuzzleValidator, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzleId = req.params.puzzleId;
      const puzzle = await sudokuService.getPuzzleById("temp", puzzleId);
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


  return router
}


