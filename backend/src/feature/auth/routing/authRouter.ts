import { Router } from "express";
import { loginBodyValidator, registerBodyValidator } from "../middleware/validation";
import { AuthenticationError } from "../errors/authenticationError";
import { AuthenticationService } from "../service/authenticationService";
import { signToken } from "../handler/jwt";

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

      req.session.save(async (err) => {
        if(err) {
          return next(err)
        }
        // Additive: web ignores `token` and uses the session cookie; the
        // mobile client stores `token` and sends it as a bearer header.
        try {
          const token = await signToken({
            id: user.id,
            username: user.username,
            role: user.role,
          })
          return res.json({ ...user, token })
        } catch (tokenErr) {
          return next(tokenErr)
        }
      })
    })
  })

  router.get('/logout', async (req, res, next) => {
    req.session.user = undefined

    req.session.save((err) => {
      if(err) {
        next(err)
      }
      req.session.regenerate((err) => {
        if(err) {
          next(err)
        }
        res.sendStatus(204)
      })
    })
  })

  router.post('/register', registerBodyValidator, async (req, res, next) => {
    const userId = await authService.registerUser(req.body)
    if(!userId) {
      return res.sendStatus(500)
    }
    req.session.regenerate((err) => {
      if(err) {
        next(err);
      }
      req.session.user = {
        username: req.body.username,
        id: userId,
        role: 'user'
      }

      req.session.save(async (err) => {
        if(err) {
          return next(err)
        }
        try {
          const token = await signToken({
            id: userId,
            username: req.body.username,
            role: 'user',
          })
          res.status(201).send({
            id: userId,
            displayName: req.body.displayName,
            username: req.body.username,
            role: 'user',
            token
          })
        } catch (tokenErr) {
          return next(tokenErr)
        }
      })
    })
  })
  return router
}
