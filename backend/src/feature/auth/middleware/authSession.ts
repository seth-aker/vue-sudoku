import { getSession } from "@auth/express"
import { Request, Response, NextFunction } from "express"
import { authConfig } from "../config"

 export async function authSession(req: Request, res: Response, next: NextFunction) {
   res.locals.session = await getSession(req, authConfig)
   next()
 }
