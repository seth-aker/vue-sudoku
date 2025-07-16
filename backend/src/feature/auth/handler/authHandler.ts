import { NextFunction, Request, Response } from "express";

export type AuthHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
