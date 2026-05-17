import { z } from 'zod'

/**
 * Username + password rules shared between login and register forms.
 * Mirrors the same regex/length constraints the backend enforces, so client
 * validation matches what the server will accept.
 */

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/

export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    'Password must contain a minimum of 8 characters, one uppercase, one lowercase, one number, and one special character',
  )

export const usernameSchema = z.string().min(4, 'Username must be at least 4 characters')

export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  displayName: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
