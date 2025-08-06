import Express from "express"
import { AuthHandler } from "../handler/authHandler"
export default function AuthRouter(authHandler: AuthHandler) {
  const router = Express.Router()
  router.use(authHandler)
  return router
}
