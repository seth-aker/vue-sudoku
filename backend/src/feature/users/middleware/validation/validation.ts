import { NextFunction, Request, Response } from "express";
import { updateUserSchema } from "./schema/userSchema";
import { ValidationError } from "@/core/errors/validationError";

export function updateUserValidator(req: Request, res: Response, next: NextFunction) {
    const result = updateUserSchema.safeParse(req.body);
    if(!result.success)  {
        throw new ValidationError(result.error)
    }
    next()
}