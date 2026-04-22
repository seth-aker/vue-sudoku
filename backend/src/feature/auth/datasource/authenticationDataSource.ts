import { ISqliteUser } from "@/feature/users/datasource/models/user";
import {Database} from "better-sqlite3";
import { pbkdf2, timingSafeEqual } from "node:crypto";

export class AuthenticationDataSource {
  static instance: AuthenticationDataSource | null = null;
  private client: Database
  private constructor(db: Database) {
    this.client = db;

  }
  static create(db: Database) {
    if(!AuthenticationDataSource.instance) {
      this.instance = new AuthenticationDataSource(db);
    }
    return this.instance;
  }
  verify(email: string, password: string, done: (err: any, user?: Express.User | false, options?: any) => void) {
    try {
      const res = this.client.prepare<string, ISqliteUser>(`SELECT * FROM users WHERE email = ?`).get(email);
      if(!res || !res.password_hash || !res.salt) {
        return done(null, false, {message: 'Incorrect Username or Password'})
      }
      pbkdf2(password, res.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
        if(err) {
          return done(err)
        }
        if(!timingSafeEqual(res.password_hash!, hashedPassword)) {
          return done(null, false, {message: ' Incorrect Username or Password'})
        }
        return done(null, res);
      })

    } catch (err) {
      return done(err)
    }
  }
  serializeUser(user: ISqliteUser, callback: (err?: any, user?: {id: string, username: string}) => void) {
    process.nextTick(() => {
      callback(null, {id: user.user_id.toString(), username: user.email})
    })
  }
  deserializeUser(user: {id: string, username: string}, callback: (err?: any, user?: {id: string, username: string}) => void) {
    process.nextTick(() => {
      callback(null, user)
    })
  }
}
