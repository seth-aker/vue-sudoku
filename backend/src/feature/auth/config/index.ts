import process from "node:process"

if (!process.env.SESSION_SECRET) {
  throw new Error("Missing Environment Variable: SESSION_SECRET")
}
if (process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long")
}
if (!process.env.JWT_SECRET) {
  throw new Error("Missing Environment Variable: JWT_SECRET")
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long")
}

export const authConfig = {
  secret: process.env.SESSION_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  /** TTL like "7d", "15m", "3600s". Defaults to 7d. */
  jwtTtl: process.env.JWT_TTL ?? '7d',
}
