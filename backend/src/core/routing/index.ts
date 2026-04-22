import { Router, Application } from "express";
import { sudokuRouter } from "../../feature/sudoku/routing/index";
// import { userRouter } from "@/feature/users/routing";
import { authRouter } from "@/feature/auth/routing";
export const configureRouting = (app: Application) => {
  const router = Router()
  app.use('/api', router)
  // app.use('/ping', (req, res) => res.send('Pong'))
  router.use('/sudoku', sudokuRouter)
  router.use('/auth', authRouter)
  // router.use('/user', userRouter)
}
