import { NextFunction, Request, Response } from "express";
import { getSession, Session } from "@auth/express";
import { authConfig } from "../config";

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const session: Session | null = res.locals.session ?? (await getSession(req, authConfig));
  if(!session?.user) {
    res.redirect('/signin')
  } else {
    next();
  }
}
