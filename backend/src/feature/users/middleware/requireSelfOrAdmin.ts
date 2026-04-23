import { requireAdmin } from "@/feature/auth/middleware/validation";
import { NextFunction, Request, Response } from "express";

export const requireSelfOrAdmin = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  if(Number.isNaN(Number.parseInt(userId))) {
    return res.sendStatus(400)
  }
  if(!req.session.user) {
    return res.sendStatus(401)
  }
  if(req.session.user.id !== userId) {
    return requireAdmin(req, res, next)
  }
  return next()

}