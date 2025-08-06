import { authenticateUser } from "@/feature/auth/middleware/authenticateUser";
import { UserService } from "../service/userService";
import Express, {NextFunction, Request, Response} from "express";
export function UserRouter(userService: UserService) {
  const router = Express.Router();

  router.use(authenticateUser)

  router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const {session} = res.locals
    if(session.user.id !== req.params.userId) {
      res.sendStatus(403)
    } else {
      try {
        return await userService.getUser(session.user.id)
      } catch (err) {
        next(err);
      }
    }
  })
  router.put('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const { session } = res.locals;
    if(session.user.id !== req.params.userId) {
      res.sendStatus(403)
    } else {
      try {
        return await userService.updateUser(session.user.id, req.body)
      } catch (err) {
        next(err);
      }
    }
  })
  router.delete('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const { session } = res.locals;
    if(session.user.id !== req.params.userId) {
      res.sendStatus(403)
    } else {
      try {
        return await userService.deleteUser(session.user.id)
      } catch (err) {
        next(err);
      }
    }
  })
  return router;
}
