import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { parseBearer, verifyJwt } from "../jwt";

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

/**
 * Canonical "current user" attached by `requireLoggedin` regardless of whether
 * the request was authenticated via session cookie (web) or JWT bearer (mobile).
 * Handlers downstream of `requireLoggedin` can rely on `req.authUser` being set.
 */
export interface AuthUser {
  id: string
  role: string
  /** Present when authed via session, may be absent when authed via JWT (claims don't carry username). */
  username?: string
}
declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser
    }
  }
}

/**
 * Resolve the current user from either a session cookie or an `Authorization: Bearer …` JWT.
 * Returns null if neither path produces a valid user.
 *
 * Note: when authed via JWT, the bearer claims carry `sub` (user id) and `role` only.
 * Handlers that need username/displayName should call `userService.getUser(authUser.id)`.
 */
export async function resolveAuthUser(req: Request): Promise<AuthUser | null> {
  if (req.session.user) {
    return {
      id: req.session.user.id,
      role: req.session.user.role,
      username: req.session.user.username,
    }
  }
  const token = parseBearer(req.headers.authorization)
  if (!token) return null
  const claims = await verifyJwt(token)
  if (!claims) return null
  return { id: claims.sub, role: claims.role }
}

export const requireLoggedin = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = await resolveAuthUser(req)
  if (!authUser) {
    return res.sendStatus(401)
  }
  req.authUser = authUser
  return next()
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.authUser ?? await resolveAuthUser(req)
  if (!authUser || authUser.role !== 'admin') {
    return res.sendStatus(403)
  }
  req.authUser = authUser
  return next()
}

export const loginBodyValidator = (req: Request, _res: Response, next: NextFunction) => {
  const validationResult = loginBodySchema.safeParse(req.body)
  if(!validationResult.success) {
    return next(validationResult.error)
  }
  next()
}

export const registerBodyValidator = (req: Request, _res: Response, next: NextFunction) => {
  const validationResult = registerBodySchema.safeParse(req.body)
  if(!validationResult.success) {
    return next(validationResult.error)
  }
  next()
}
