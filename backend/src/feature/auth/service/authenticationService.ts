import z from "zod/v4"
import { registerBodySchema } from "../middleware/validation"
import { IUserDTO } from "@/feature/users/datasource/models/user"

export interface AuthenticationService {
  verify: (username: string, password: string) => Promise<IUserDTO>
  registerUser: (user: z.infer<typeof registerBodySchema>) => Promise<string | undefined>
  generateAccessToken: (userId: string) => Promise<string>
  getNewTokenSet: (userId: string) => Promise<{accessToken: string, refreshToken: string}>
  refreshAccessToken: (refreshToken: string) => Promise<{accessToken: string, refreshToken: string}>
  clearToken: (token: string) => Promise<void>
}
