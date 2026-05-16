// Augments Express `Request` with `user`, populated by the `resolveIdentity`
// middleware from either an active express-session or a bearer JWT. This makes
// session (web) and JWT (mobile) identity transparent to route handlers and
// the requireLoggedin/requireAdmin/requireSelfOrAdmin guards.
import 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        role: string
      }
    }
  }
}

export {}
