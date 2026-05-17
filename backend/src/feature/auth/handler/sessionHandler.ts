import session from 'express-session'
import { authConfig } from '../config'
import { Request } from 'express'
import { PgSessionStore } from '../datasource/pgSessionStore'
import sql from '@/core/dataSource/postgres'

export const sessionHandler = () => {
  return session({
    secret: authConfig.secret,
    store: PgSessionStore.create({client: sql}),
    resave: false,
    saveUninitialized: false,
    cookie: function (req: Request) {
      const isProd = process.env.NODE_ENV === 'production'
      return {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: req.secure || isProd,
        // 'strict' in prod blocks CSRF; 'lax' in dev keeps things workable
        // across http://localhost:5173 → http://localhost:3666.
        sameSite: isProd ? 'strict' : 'lax',
      }
    },
    name: 'sudoku',
  })
}
