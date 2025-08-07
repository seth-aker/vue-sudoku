import express, { Application } from "express";
import { sudokuRouter } from "../../feature/sudoku/routing/index";
import { userRouter } from "@/feature/users/routing";

export const configureRouting = (app: Application) => {
  const router = express.Router()
  app.use('/api', router)
  router.use('/sudoku', sudokuRouter)
  router.use('/user', userRouter)
}
