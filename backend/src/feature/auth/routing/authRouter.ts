import { Router } from "express";
import { loginBodyValidator, registerBodyValidator } from "../middleware/validation";
import { AuthenticationError } from "../errors/authenticationError";
import { AuthenticationService } from "../service/authenticationService";

declare module 'express-session' {
    interface SessionData {
      user?: {
        id: string;
        username: string;
        role: string;
      }
    }
}

export function AuthRouter(authService: AuthenticationService) {
  const router = Router()

  router.post('/login', loginBodyValidator, async (req, res, next) => {
    const verifyRes = await authService.verify(req.body.username, req.body.password)
    const user = verifyRes.user;
    if(!user || verifyRes.err) {
      return next(verifyRes?.err ?? new AuthenticationError("Incorrect email or password"))
    }
    req.session.regenerate((err) => {
      if(err) {
        return next(err)
      }
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
      }

      req.session.save((err) => {
        if(err) {
          return next(err)
        }
        return res.json(user)
      })
    })
  })

  /**
   * Mobile-flavored login. Issues a JWT bearer token; does NOT touch the session
   * cookie. Web clients keep using POST /login (session cookie). Mobile clients
   * call this endpoint and use Authorization: Bearer <token> on subsequent calls.
   */
  router.post('/token', loginBodyValidator, async (req, res, next) => {
    try {
      const verifyRes = await authService.verify(req.body.username, req.body.password)
      const user = verifyRes.user
      if (!user || verifyRes.err) {
        return next(verifyRes?.err ?? new AuthenticationError("Incorrect username or password"))
      }
      const { token, expiresAt } = await authService.issueToken(user)
      return res.status(200).json({ token, expiresAt, user })
    } catch (err) {
      return next(err)
    }
  })

  // /auth/logout is POST (state-changing). Returns 200 with a small body
  // so clients that parse JSON unconditionally don't choke on an empty 204.
  router.post('/logout', async (req, res, next) => {
    req.session.user = undefined

    req.session.save((err) => {
      if(err) {
        return next(err)
      }
      req.session.regenerate((err) => {
        if(err) {
          return next(err)
        }
        res.status(200).json({ message: 'Logged out' })
      })
    })
  })

  router.post('/register', registerBodyValidator, async (req, res, next) => {
    try {
      const userId = await authService.registerUser(req.body)
      if(!userId) {
        return next(new AuthenticationError('Registration failed'))
      }
      req.session.regenerate((err) => {
        if(err) {
          return next(err);
        }
        req.session.user = {
          username: req.body.username,
          id: userId,
          role: 'user'
        }

        req.session.save((err) => {
          if(err) {
            return next(err)
          }
          res.status(201).send({
            id: userId,
            displayName: req.body.displayName,
            username: req.body.username,
            role: 'user'
          })
        })
      })
    } catch (err) {
      return next(err)
    }
  })
  return router
}
