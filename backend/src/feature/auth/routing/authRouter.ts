// import { UserDataSource } from "@/feature/users/datasource/userDataSource";
import { Router } from "express";
import { loginBodyValidator, registerBodyValidator } from "../middleware/validation";
import { AuthenticationError } from "../errors/authenticationError";
import { AuthenticationService } from "../service/authenticationService";

declare module 'express-session' {
    interface SessionData {
      user?: {
        id: string;
        email: string;
      }
    }
}

export function AuthRouter(authService: AuthenticationService) {
  const router = Router()

  router.post('/login', loginBodyValidator, async (req, res, next) => {
    const verifyRes = await authService.verify(req.body.email, req.body.password)
    if(!verifyRes || verifyRes.err) {
      throw verifyRes?.err ?? new AuthenticationError("Incorrect email or password")
    }
    req.session.regenerate((err) => {
      if(err) {
        next(err)
      }
      req.session.user = {
        id: verifyRes.id!,
        email: verifyRes.email!
      }

      req.session.save((err) => {
        if(err) {
          return next(err)
        }
        res.sendStatus(200)
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
        email: req.body.email,
        id: userId
      }

      req.session.save((err) => {
        if(err) {
          next(err)
        }
        res.sendStatus(201)
      })
    })
  })
  return router
}
