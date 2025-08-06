import express, { Application } from "express";
import { sudokuRouter } from "../../feature/sudoku/routing/index";
import AuthRouter from "../../feature/auth/routing/index";
import { authSession } from "@/feature/auth/middleware/authSession";
import { authenticateUser } from "@/feature/auth/middleware/authenticateUser";
import { userRouter } from "@/feature/users/routing";

export const configureRouting = (app: Application) => {
  const router = express.Router()
  app.use(authSession)
  app.use('/api', router)
  router.use('/auth', AuthRouter)
  router.get('/', authenticateUser, (req, res) => {
    res.send('Hello Authenticated World')
  })
  router.use('/sudoku', sudokuRouter)
  router.use('/user', userRouter)
}
