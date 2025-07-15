import express, { Application } from "express";
import { sudokuRouter } from "../../feature/sudoku/routing/index";

export const configureRouting = (app: Application) => {
  const router = express.Router()
  app.use('/api', router)
  router.use('/sudoku', sudokuRouter)
}
