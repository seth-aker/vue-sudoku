import z from "zod"
import { registerBodySchema } from "../middleware/validation"
import { IUserDTO } from "@/feature/users/datasource/models/user"

export interface IVerifyResponse {
  err?: any
  user?: IUserDTO
}

export interface IIssuedToken {
  token: string
  /** absolute expiry, ms since epoch */
  expiresAt: number
}

export interface AuthenticationService {
  verify: (username: string, password: string) => Promise<IVerifyResponse>
  registerUser: (user: z.infer<typeof registerBodySchema>) => Promise<string | undefined>
  issueToken: (user: IUserDTO) => Promise<IIssuedToken>
}
