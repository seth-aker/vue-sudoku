import z from "zod"
import { registerBodySchema } from "../middleware/validation"
import { IUserDTO } from "@/feature/users/datasource/models/user"

export interface IVerifyResponse {
  err?: any
  user?: IUserDTO
}

export interface AuthenticationService {
  verify: (username: string, password: string) => Promise<IVerifyResponse>
  registerUser: (user: z.infer<typeof registerBodySchema>) => Promise<string | undefined>
  generateAccessToken: (userId: string) => Promise<string>
  refreshAccessToken: (refreshToken: string) => Promise<{accessToken: string, refreshToken: string}>
  generateRefreshToken: () => string
  saveRefreshToken: (userId: string, token: string) => Promise<void>
  deleteRefreshToken: (token: string) => Promise<void>
}
