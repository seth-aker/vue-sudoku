import { NextFunction, Request, Response } from "express";
import * as z from "zod";

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/

const passwordSchema = z.string().refine((pw) => passwordRegex.test(pw), "Password must contain a minimum of 8 characters, one uppercase, one lowercase, one number, and one special character")

export const loginBodySchema = z.object({
  username: z.string().refine((val) => val.length >= 4),
  password: passwordSchema
})

export const registerBodySchema = z.object({
  username: z.string().refine((val) => val.length >= 4),
  password: passwordSchema,
  displayName: z.string().optional()
})

// Identity is resolved from the session OR a bearer JWT by the global
// `resolveIdentity` middleware; these guards check `req.user` so both the web
// (session) and mobile (JWT) clients are supported uniformly.
export const requireLoggedin = (req: Request, res: Response, next: NextFunction) => {
  if(req.user) {
    return next()
  }
  return res.sendStatus(401)
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if(req.user && req.user.role === 'admin') {
    return next()
  }
  return res.sendStatus(403)
}

export const loginBodyValidator = (req: Request, _res: Response, next: NextFunction) => {
  const validationResult = loginBodySchema.safeParse(req.body)
  if(!validationResult.success) {
    throw validationResult.error
  }
  next()
}

export const registerBodyValidator = (req: Request, _res: Response, next: NextFunction) => {
  const validationResult = registerBodySchema.safeParse(req.body)
  if(!validationResult.success) {
    throw validationResult.error
  }
  next()
}
