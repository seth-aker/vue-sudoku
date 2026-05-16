import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../handler/jwt'

/**
 * Resolves request identity from EITHER an active express-session OR a
 * `Authorization: Bearer <jwt>` header, populating `req.user`. This makes the
 * session (web) and JWT (mobile) auth sources transparent to downstream
 * route handlers and `requireLoggedin`/`requireAdmin`/`requireSelfOrAdmin`.
 *
 * It is a *resolver*, not a guard — it never rejects; enforcement stays in the
 * existing `require*` middleware.
 */
export const resolveIdentity = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Session takes precedence (existing web flow, unchanged).
  if (req.session?.user) {
    req.user = {
      id: req.session.user.id,
      username: req.session.user.username,
      role: req.session.user.role,
    }
    return next()
  }

  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length).trim()
    if (token) {
      const identity = await verifyToken(token)
      if (identity) {
        req.user = identity
      }
    }
  }
  return next()
}
