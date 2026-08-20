import { ISqlUser, IUserDTO } from "@/feature/users/datasource/models/user";
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { AuthenticationService } from "./authenticationService";
import { AuthenticationError } from "../errors/authenticationError";
import { UserDataSource } from "@/feature/users/datasource/userDataSource";
import { registerBodySchema } from "../middleware/validation";
import z from "zod/v4";
import { DatabaseError } from "@/core/errors/databaseError";
import { Sql } from "postgres";
import { config } from "@/core/config";
import { SignJWT } from "jose";
import { TokenDataSource } from "../datasource/tokenDataSource";
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
  async verify(username: string, password: string): Promise<IUserDTO> {
      const [res] = await this.client<ISqlUser[]>`SELECT * FROM users WHERE username = ${username}`

      const salt = res?.salt ? Buffer.from(res.salt, 'hex') : DUMMY_SALT
      const storedPassword = res.password_hash ? Buffer.from(res.password_hash, 'hex'): DUMMY_HASHED
      const hashedPassword = scryptSync(password.normalize(), salt, SCRYPT_KEYLEN)
      const matches = timingSafeEqual(storedPassword, hashedPassword)
      if(!res || !res.salt || !res.password_hash || !matches) {
        throw new AuthenticationError("Incorrect Username or Password");
      }
      
      return {
          id: res.user_id,
          username: res.username,
          role: res.role,
          displayName: res.display_name ?? undefined,
          imageUrl: res.image_url ?? undefined,
          currentPuzzleId: res.current_puzzle_id ?? undefined
        
      }
  }
  async registerUser(user: z.infer<typeof registerBodySchema>) {
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
  }

  async refreshAccessToken(refreshToken: string) {
    const {token: newRefresh, userId } = await this.tokenDataSource.rotateRefreshToken(refreshToken);
    const newAccessToken = await this.generateAccessToken(userId);
    return {refreshToken: newRefresh, accessToken: newAccessToken}
  }

  async getNewTokenSet(userId: string) {
    const refreshToken = await this.tokenDataSource.create(userId);
    const accessToken = await this.generateAccessToken(userId);
    return {accessToken, refreshToken};
  }
  async clearToken(token: string) {
    await this.tokenDataSource.delete(token);
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
}
