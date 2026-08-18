import { NextFunction, Request, Response } from "express";
import * as z from "zod";

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/

const passwordSchema = z.string().refine((pw) => passwordRegex.test(pw), "Password must contain a minimum of 8 characters, one uppercase, one lowercase, one number, and one special character")

const tokenBodySchema = z.discriminatedUnion('grant_type', [
  z.object({
    grant_type: z.literal('password'),
    username: z.string().min(4),
    password: z.string().min(4)
  }),
  z.object({
    grant_type: z.literal('refresh_token'),
    refreshToken: z.string().min(1)
  })
])
export const loginBodySchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4)
})

export const registerBodySchema = z.object({
  username: z.string().refine((val) => val.length >= 4),
  password: passwordSchema,
  displayName: z.string().optional()
})

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

export const tokenBodyValidator = (req: Request, _res: Response, next: NextFunction) => {
  const result = tokenBodySchema.safeParse(req.body);
  if (!result.success) return next(result.error);
  req.body = result.data;
  next();
}
