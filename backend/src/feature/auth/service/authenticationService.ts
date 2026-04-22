import z from "zod"
import { registerBodySchema } from "../middleware/validation"

export interface IVerifyResponse {
  err?: any
  id?: string,
  email?: string,
}

export interface AuthenticationService {
  verify: (email: string, password: string) => Promise<IVerifyResponse | undefined>
  registerUser: (user: z.infer<typeof registerBodySchema>) => Promise<string | undefined>
}