import express, { Application } from "express";
import { sudokuRouter } from "../../feature/sudoku/routing/index.ts";
import AuthRouter from "../../feature/auth/routing/index.ts";

export const configureRouting = (app: Application) => {
  const router = express.Router()
  app.use('/api', router)
  router.use('/auth', AuthRouter)
  router.use('/sudoku', sudokuRouter)
}
