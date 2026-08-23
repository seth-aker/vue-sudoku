import { Request, Response, Router } from "express";
import { loginBodyValidator, registerBodyValidator, } from "../middleware/validation";
import { AuthenticationError } from "../errors/authenticationError";
import { AuthenticationService } from "../service/authenticationService";
import { authLimiter } from "../middleware/rateLimiter";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { ErrorType } from "@/core/errors/errorTypes";

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
  router.post('/login', authLimiter(),  loginBodyValidator, async (req, res, _next) => {
    const user = await authService.verify(req.body.username, req.body.password)

    const {accessToken, refreshToken} = await authService.getNewTokenSet(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({ user })
  })

  router.post('/logout', authLimiter(), async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if(refreshToken) {
      await authService.clearToken(refreshToken);
    }
    
    clearAuthCookies(res);

    res.sendStatus(204);
  })

  router.post('/register', authLimiter(), registerBodyValidator, async (req, res, _next) => {
    const userId = await authService.registerUser(req.body)
    if(!userId) {
      return res.sendStatus(500)
    }

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
  router.post('/token', authLimiter(), async (req: Request<{}, {}, TokenRequestBody>, res: Response, _next) => {
    switch(req.body.grant_type) {
      case 'password': {
        const user = await authService.verify(req.body.username, req.body.password)
     
       const { accessToken, refreshToken } = await authService.getNewTokenSet(user.id);

        res.json({accessToken, refreshToken, user})
        return;
      }
      case 'refresh_token':{
        const refreshToken = req.body.refreshToken;
        if(!refreshToken) {
          throw new AuthenticationError('Missing or invalid refresh token.', {
            type: ErrorType.TOKEN_MISSING
          })
        }
        const {accessToken, refreshToken: newRefreshToken} = await authService.refreshAccessToken(refreshToken);
        return res.json({accessToken, refreshToken: newRefreshToken})
      }
      default: {
        throw new AuthenticationError('Invalid grant_type', {
          type: ErrorType.MALFORMED_BODY 
        })
      }
    }
  })
  return router
}
