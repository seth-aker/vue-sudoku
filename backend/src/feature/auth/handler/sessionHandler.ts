import session from 'express-session'
import { SqliteSessionStore } from '../datasource/sqliteSessionStore'
import { db } from '@/core/dataSource/sqlite3'
import { authConfig } from '../config'
import { config } from '@/core/config'
import { Request } from 'express'

export const sessionHandler = () => {
  return session({
    secret: authConfig.secret,
    store: SqliteSessionStore.create({client: db}),
    resave: false,
    saveUninitialized: false,
    cookie: function (req: Request) {
      return {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        // domain: config.audience,
        secure: req.secure || process.env.NODE_ENV === 'production',
      }
      
    },
    name: 'sudoku',
  })
}
