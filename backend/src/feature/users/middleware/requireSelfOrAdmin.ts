import { requireAdmin, resolveAuthUser } from "@/feature/auth/middleware/validation";
import { NextFunction, Request, Response } from "express";
import z from "zod";

export const requireSelfOrAdmin = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  if(!z.string().uuid().safeParse(userId).success) {
    return res.sendStatus(400)
  }
  const authUser = await resolveAuthUser(req)
  if(!authUser) {
    return res.sendStatus(401)
  }
  req.authUser = authUser
  if(authUser.id !== userId) {
    return requireAdmin(req, res, next)
  }
  return next()
}
