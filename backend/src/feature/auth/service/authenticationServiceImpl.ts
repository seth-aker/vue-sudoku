import { IUserDTO } from "@/feature/users/datasource/models/user";
import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import { AuthenticationService } from "./authenticationService";
import { AuthenticationError } from "../errors/authenticationError";
import { UserDataSource } from "@/feature/users/datasource/userDataSource";
import { registerBodySchema } from "../middleware/validation";
import z from "zod/v4";
import { DatabaseError } from "@/core/errors/databaseError";
import { config } from "@/core/config";
import { SignJWT } from "jose";
import { TokenDataSource } from "../datasource/tokenDataSource";
import { ErrorType } from "@/core/errors/errorTypes";
import { AuthorizationError } from "../errors/authorizationError";
const SCRYPT_KEYLEN = 64
const SALT_LEN = 16

const DUMMY_SALT = randomBytes(SALT_LEN)
const DUMMY_HASHED = scryptSync('not-a-real-password', DUMMY_SALT, SCRYPT_KEYLEN)

export class AuthenticationServiceImpl implements AuthenticationService {
  static instance: AuthenticationServiceImpl | null = null;
  private userDataSource: UserDataSource;
  private tokenDataSource: TokenDataSource; 
  private textEncoder: TextEncoder;
  private constructor(userDataSource: UserDataSource, tokenDataSource: TokenDataSource) {
    this.userDataSource = userDataSource;
    this.tokenDataSource = tokenDataSource;
    this.textEncoder = new TextEncoder();
  }
  
  static create(userDataSource: UserDataSource, tokenDataSource: TokenDataSource): AuthenticationServiceImpl {
    if(AuthenticationServiceImpl.instance === null) {
      AuthenticationServiceImpl.instance = new AuthenticationServiceImpl(userDataSource, tokenDataSource);
    }
    return AuthenticationServiceImpl.instance
  }
  async verify(email: string, password: string): Promise<IUserDTO> {
      const res = await this.userDataSource.getUserByEmail(email);
      const salt = res?.salt ? Buffer.from(res.salt, 'hex') : DUMMY_SALT
      const storedPassword = res.password_hash ? Buffer.from(res.password_hash, 'hex'): DUMMY_HASHED
      const hashedPassword = scryptSync(password.normalize(), salt, SCRYPT_KEYLEN)
      const matches = timingSafeEqual(storedPassword, hashedPassword)
      if(!res || !res.salt || !res.password_hash || res.deleted_at || !matches) {
        throw new AuthenticationError("Incorrect Email or Password");
      }
      if(!res.email_verified) {
	throw new AuthorizationError("Email not verified", { type: ErrorType.UNVERIFIED_EMAIL })
    } 
      return {
          id: res.user_id,
	  email: res.email,
          username: res.username,
          role: res.role,
          imageUrl: res.image_url ?? undefined,
          currentPuzzleId: res.current_puzzle_id ?? undefined
      }
  }
  async registerUser(user: z.infer<typeof registerBodySchema>) {
      const salt = randomBytes(16);
      const hashedPassword = scryptSync(user.password.normalize(), salt, 64);
      if(!user.tosAcknowledged) {
	throw new AuthenticationError("Terms of Service must be acknowledged", {type: ErrorType.VALIDATION_FAILED})
      }
      const userId = await this.userDataSource.createUser({
	email: user.email.toLowerCase(),
        username: user.username.toLowerCase(),
        passwordHash: hashedPassword.toString('hex'),
        salt: salt.toString('hex'),
	tosAcknowledged: user.tosAcknowledged,
	role: 'user',
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
    const audience = config.audience;
    const issuerUrl = config.issuer;
    return await new SignJWT({
      userId: userId,
      role: user.role
    })
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('15m')
    .setIssuedAt()
    .setIssuer(issuerUrl)
    .setAudience(audience)
    .sign(secret);
  }
}
