import { ISqlUser } from "@/feature/users/datasource/models/user";
import {Database} from "better-sqlite3";
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { AuthenticationService, IVerifyResponse } from "./authenticationService";
import { AuthenticationError } from "../errors/authenticationError";
import { UserDataSource } from "@/feature/users/datasource/userDataSource";
import { registerBodySchema } from "../middleware/validation";
import z from "zod";
import { DatabaseError } from "@/core/errors/databaseError";
import { CustomError } from "@/core/errors/customError";
import { Sql } from "postgres";

declare global {
    namespace Express {
        interface User {
            id: string,
            email: string,
            role: string
        }
    }
}


export class AuthenticationServiceImpl implements AuthenticationService {
  static instance: AuthenticationServiceImpl | null = null;
  private client: Sql
  private userDataSource: UserDataSource;
  private constructor(db: Sql, userDataSource: UserDataSource) {
    this.client = db;
    this.userDataSource = userDataSource;
  }
  static create(db: Sql, userDataSource: UserDataSource): AuthenticationServiceImpl {
    if(AuthenticationServiceImpl.instance === null) {
      AuthenticationServiceImpl.instance = new AuthenticationServiceImpl(db, userDataSource);
    }
    return AuthenticationServiceImpl.instance
  }
  async verify(email: string, password: string): Promise<IVerifyResponse> {
    try {
      const [res] = await this.client<ISqlUser[]>`SELECT * FROM users WHERE email = ${email}`
      if(!res || !res.password_hash || !res.salt) {
        return {err: new AuthenticationError("Incorrect Email or Password")}
      }
      const hashedPassword = scryptSync(password.normalize(), Buffer.from(res.salt, 'hex'), 64)
      if(!timingSafeEqual(Buffer.from(res.password_hash, 'hex'), hashedPassword)) {
        return {err: new AuthenticationError("Incorrect Email or Password")}
      }
      return {
        user: {
          id: res.user_id,
          email: res.email,
          role: res.role,
          name: res.name ?? undefined,
          imageUrl: res.image_url ?? undefined,
          currentPuzzleId: res.current_puzzle ?? undefined,
        }
      }
    } catch (err) {
      return {err}
    }
  }
  async registerUser(user: z.infer<typeof registerBodySchema>) {
    try {
      const salt = randomBytes(16);
      const hashedPassword = scryptSync(user.password.normalize(), salt, 64);

      const userId = await this.userDataSource.createUser({
        name: user.name,
        email: user.email,
        passwordHash: hashedPassword.toString('hex'),
        salt: salt.toString('hex')
      })

      if(!userId) {
        throw new DatabaseError(`Insert Operation failed`)
      }
      return userId

    } catch (err) {
      if(err instanceof CustomError) {
        throw err
      }
      throw new AuthenticationError(`An error occurred registering user: ${err}`)
    }

  }
  serializeUser(user: Express.User, callback: (err?: any, user?: Express.User) => void) {
    process.nextTick(() => {
      callback(null, {id: user.id, email: user.email, role: user.role})
    })
  }
  deserializeUser(user: Express.User, callback: (err?: any, user?: Express.User) => void) {
    process.nextTick(() => {
      callback(null, {id: user.id, email: user.email, role: user.role})
    })
  }
}
