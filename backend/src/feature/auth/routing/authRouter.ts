import { NextFunction, Request, Response, Router } from "express";
import { loginBodyValidator, registerBodyValidator, tokenBodyValidator } from "../middleware/validation";
import { AuthenticationError } from "../errors/authenticationError";
import { AuthenticationService } from "../service/authenticationService";
import { authLimiter } from "../middleware/rateLimiter";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";

type TokenPasswordBody = {
  grant_type: 'password',
  username: string,
  password: string,
}

type TokenRefreshBody = {
  grant_type: 'refresh_token',
  refreshToken: string
}

type TokenRequestBody = TokenPasswordBody | TokenRefreshBody;

export function AuthRouter(authService: AuthenticationService) {
  const router = Router()

  // web only endpoint
  router.post('/login', authLimiter(),  loginBodyValidator, async (req, res, next) => {
    const verifyRes = await authService.verify(req.body.username, req.body.password)
    const user = verifyRes.user;
    if(!user || verifyRes.err) {
      return next(verifyRes?.err ?? new AuthenticationError("Incorrect email or password"))
    }

    const accessToken = await authService.generateAccessToken(user.id);
    const refreshToken = authService.generateRefreshToken();

    await authService.saveRefreshToken(user.id, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user })
  })

  router.post('/logout', authLimiter(), async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if(refreshToken) {
      await authService.deleteRefreshToken(refreshToken);
    }
    
    clearAuthCookies(res);

    res.sendStatus(201);
  })

  router.post('/register', authLimiter(), registerBodyValidator, async (req, res, next) => {
    const userId = await authService.registerUser(req.body)
    if(!userId) {
      return res.sendStatus(500)
    }
    const accessToken = await authService.generateAccessToken(userId);
    const refreshToken = authService.generateRefreshToken();    
    
    await authService.saveRefreshToken(userId, refreshToken);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      id: userId,
      displayName: req.body.displayName,
      username: req.body.username,
      role: 'user'
    })
  })

  // web only endpoint
  router.post('/refresh', authLimiter(), async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken) {
      return res.status(401).send({error: 'Refresh token required'})
    }
    const {accessToken, refreshToken: newRefreshToken} = await authService.refreshAccessToken(refreshToken);

    setAuthCookies(res, accessToken, newRefreshToken);
    res.sendStatus(201)
  })

  // mobile only endpoint
  router.post('/token', tokenBodyValidator, authLimiter(), async (req: Request<{}, {}, TokenRequestBody>, res: Response, next) => {
    switch(req.body.grant_type) {
      case 'password': {
        const verifyRes = await authService.verify(req.body.username, req.body.password)
        const user = verifyRes.user;
        if(!user || verifyRes.err) {
          return next(verifyRes?.err ?? new AuthenticationError("Incorrect email or password"))
        }

        const accessToken = await authService.generateAccessToken(user.id);
        const refreshToken = authService.generateRefreshToken();

        await authService.saveRefreshToken(user.id, refreshToken);

        res.json({accessToken, refreshToken, user})
        return;
      }
      case 'refresh_token':{
        const refreshToken = req.body.refreshToken;
        if(!refreshToken) {
          return res.status(401).send({error: 'Missing/invlalid refresh token'})
        }
        const {accessToken, refreshToken: newRefreshToken} = await authService.refreshAccessToken(refreshToken);
        return res.json({accessToken, refreshToken: newRefreshToken})
      }
      default: {
        return res.status(400).send('Invalid grant_type')
      }
    }
  })
  return router
}
