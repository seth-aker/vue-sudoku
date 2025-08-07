import express, { Application } from "express";
import { sudokuRouter } from "../../feature/sudoku/routing/index";
import { userRouter } from "@/feature/users/routing";

export const configureRouting = (app: Application) => {
  const router = express.Router()
  app.use('/api', router)
  app.use('/ping', (req, res) => res.send('Pong'))
  router.use('/sudoku', sudokuRouter)
  router.use('/user', userRouter)
}
