// import { UserDataSource } from "@/feature/users/datasource/userDataSource";
import { Router } from "express";
import { loginBodyValidator, registerBodyValidator } from "../middleware/validation";
import { AuthenticationError } from "../errors/authenticationError";
import { AuthenticationService } from "../service/authenticationService";

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        userEmail?: string;
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
      req.session.userId = verifyRes.id
      req.session.userEmail = verifyRes.email

      req.session.save((err) => {
        if(err) {
          return next(err)
        }
        res.sendStatus(200)
      })
    })
  })

  router.get('/logout', async (req, res, next) => {
    req.session.userEmail = undefined
    req.session.userId = undefined

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
    req.session.regenerate((err) => {
      if(err) {
        next(err);
      }
      req.session.userEmail = req.body.email
      req.session.userId = userId

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
