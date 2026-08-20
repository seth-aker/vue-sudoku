import { config } from "@/core/config";
import { NextFunction, Request, Response } from "express"
import { JWTPayload, jwtVerify } from "jose";

export interface SudokuAppJwtPayload extends JWTPayload {
    userId: string, 
    username: string,
    role: 'user' | 'admin',
}
export const requireLoggedin = async (req: Request, res: Response, next: NextFunction) => {
  const token: string | undefined  = getToken(req);

  if(!token) {
    return res.sendStatus(401);
  }
  try {
    const secret = new TextEncoder().encode(config.jwtSecret)

    const { payload } = await jwtVerify(token, secret, {
        audience: config.audience,
        issuer: config.issuer,
        algorithms: ['HS256']
    });

    req.user = payload as SudokuAppJwtPayload;
    next();
  } catch (err) {
    res.sendStatus(401)
  }
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token: string | undefined = getToken(req);

  if(!token) {
    return res.sendStatus(401);
  }
  try {
    const secret = new TextEncoder().encode(config.jwtSecret);

    const { payload } = await jwtVerify(token, secret, {
        issuer: config.issuer,
        audience: config.audience,
        algorithms: ['HS256'],
    })
    if((payload as SudokuAppJwtPayload).role != 'admin') {
        return res.sendStatus(403)
    }

    req.user = payload as SudokuAppJwtPayload;
    next()
  } catch (err) {
    res.sendStatus(401)
  }
}

function getToken(req: Request) {
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return undefined;
    }
    return req.headers.authorization.split(' ')[1] || req.cookies?.accessToken;
}