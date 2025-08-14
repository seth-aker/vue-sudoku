import { RequireAuth } from "@/feature/auth/middleware/requireAuth";
import { UserService } from "../service/userService";
import Express, {NextFunction, Request, Response} from "express";
import { SyncUser } from "../middleware/syncUser";
import { updateUserValidator } from "../middleware/validation/validation";
import { DatabaseError } from "@/core/errors/databaseError";
export function UserRouter(userService: UserService, requireAuth: RequireAuth) {
  const router = Express.Router();

  router.use(requireAuth)
  router.use(SyncUser(userService))

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    // Function SycnUser middleware automatically fetches the user based on the access token sub and then attaches it to the request object so no need to perform another database query.
    try {
      res.send(JSON.stringify(req.user))
    } catch (err) {
      next(err);
    }
  })
  router.put('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    if(!req.user || (req.params.userId !== "undefined" && req.user._id !== req.params.userId)) {
      res.sendStatus(403)
    } else {
      try {
        const result = await userService.updateUser(req.user._id, req.body)
        if(result !== 1) {
          throw new DatabaseError('Error occured updateing the user')
        }
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    }
  })
  router.delete('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    if(!req.user || req.user._id !== req.params.userId) {
      res.sendStatus(403)
    } else {
      try {
        return await userService.deleteUser(req.user._id)
      } catch (err) {
        next(err);
      }
    }
  })
  return router;
}
