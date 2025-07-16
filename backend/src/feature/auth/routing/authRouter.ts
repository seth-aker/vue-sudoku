import Express, { NextFunction, Request, Response } from "express"
import { AuthHandler } from "../handler/authHandler"
export default function AuthRouter(authHandler: AuthHandler) {
  const router = Express.Router()

  router.use((res, req, next) => {console.log('signin called'); next()}, authHandler)
  return router
}
