import { ISqlUser } from "@/feature/users/datasource/models/user";
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { AuthenticationService, IVerifyResponse } from "./authenticationService";
import { AuthenticationError } from "../errors/authenticationError";
import { UserDataSource } from "@/feature/users/datasource/userDataSource";
import { registerBodySchema } from "../middleware/validation";
import z from "zod";
import { DatabaseError } from "@/core/errors/databaseError";
import { CustomError } from "@/core/errors/customError";
import { Sql } from "postgres";
import { config } from "@/core/config";
import { SignJWT } from "jose";
import { TokenDataSource } from "../datasource/tokenDataSource";
import { AuthorizationError } from "../errors/authorizationError";

declare global {
    namespace Express {
        interface User {
            id: string,
            username: string,
            role: string
        }
    }
}
const SCRYPT_KEYLEN = 64
const SALT_LEN = 16

const DUMMY_SALT = randomBytes(SALT_LEN)
const DUMMY_HASHED = scryptSync('not-a-real-password', DUMMY_SALT, SCRYPT_KEYLEN)

export class AuthenticationServiceImpl implements AuthenticationService {
  static instance: AuthenticationServiceImpl | null = null;
  private client: Sql
  private userDataSource: UserDataSource;
  private tokenDataSource: TokenDataSource; 
  private textEncoder: TextEncoder;
  private constructor(db: Sql, userDataSource: UserDataSource, tokenDataSource: TokenDataSource) {
    this.client = db;
    this.userDataSource = userDataSource;
    this.tokenDataSource = tokenDataSource;
    this.textEncoder = new TextEncoder();
  }
  
  static create(db: Sql, userDataSource: UserDataSource, tokenDataSource: TokenDataSource): AuthenticationServiceImpl {
    if(AuthenticationServiceImpl.instance === null) {
      AuthenticationServiceImpl.instance = new AuthenticationServiceImpl(db, userDataSource, tokenDataSource);
    }
    return AuthenticationServiceImpl.instance
  }
  async verify(username: string, password: string): Promise<IVerifyResponse> {
    try {
      const [res] = await this.client<ISqlUser[]>`SELECT * FROM users WHERE username = ${username}`

      const salt = res?.salt ? Buffer.from(res.salt, 'hex') : DUMMY_SALT
      const storedPassword = res.password_hash ? Buffer.from(res.password_hash, 'hex'): DUMMY_HASHED
      const hashedPassword = scryptSync(password.normalize(), salt, SCRYPT_KEYLEN)
      const matches = timingSafeEqual(storedPassword, hashedPassword)
      if(!res || !res.salt || !res.password_hash || !matches) {
        return {err: new AuthenticationError("Incorrect Username or Password")}
      }
      
      return {
        user: {
          id: res.user_id,
          username: res.username,
          role: res.role,
          displayName: res.display_name ?? undefined,
          imageUrl: res.image_url ?? undefined,
          currentPuzzleId: res.current_puzzle_id ?? undefined
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
        displayName: user.displayName,
        username: user.username,
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

  async saveRefreshToken(userId: string, token: string) {
    try {
      await this.tokenDataSource.create(token, userId);
    } catch (err) {
      if(err instanceof CustomError) {
        throw err;
      }
      throw new AuthenticationError(`An error occured saving the refresh token: ${err}`)
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const tokenRecord = await this.tokenDataSource.get(refreshToken);

      if(!tokenRecord) {
        throw new AuthorizationError(`Invalid refresh token`)
      }
      if(new Date() > tokenRecord.expires_at) {
        await this.tokenDataSource.delete(refreshToken);
        throw new AuthorizationError('Refresh token expired. Please log in again.')
      }
      const newRefreshToken = this.generateRefreshToken()
      const newAccessToken = await this.generateAccessToken(tokenRecord.user_id);
      
      await this.saveRefreshToken(tokenRecord.user_id, newRefreshToken);
      
      // delete old refresh token
      await this.deleteRefreshToken(refreshToken);
      return {refreshToken: newRefreshToken, accessToken: newAccessToken}

    } catch (err) {
      if(err instanceof CustomError) {
        throw err;
      }
      throw new AuthenticationError(`An error occured refreshing accessToken: ${err}`);
    }
  }

  async generateAccessToken(userId: string) {
    const secret =  this.textEncoder.encode(config.jwtSecret);
    const user = await this.userDataSource.getUser(userId);
    const issuerUrl = config.issuer;
    return await new SignJWT({
      userId: userId,
      role: user.role
    })
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('15m')
    .setIssuedAt()
    .setIssuer(issuerUrl)
    .sign(secret);
  }

  async deleteRefreshToken(token: string) {
    await this.tokenDataSource.delete(token);
  }

  generateRefreshToken() {
    return randomBytes(40).toString('hex');
  }
  serializeUser(user: Express.User, callback: (err?: any, user?: Express.User) => void) {
    process.nextTick(() => {
      callback(null, {id: user.id, username: user.username, role: user.role})
    })
  }
  deserializeUser(user: Express.User, callback: (err?: any, user?: Express.User) => void) {
    process.nextTick(() => {
      callback(null, {id: user.id, username: user.username, role: user.role})
    })
  }
}
