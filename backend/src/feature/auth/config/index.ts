import process from "node:process"

if(!process.env.SESSION_SECRET) {
  throw new Error("Missing Environment Variable: SESSION_SECRET")
}

export const authConfig = {
  secret: process.env.SESSION_SECRET,
  // JWT secret for the mobile bearer-token flow. Optional env var; falls back
  // to SESSION_SECRET so no new required configuration is introduced.
  jwtSecret: process.env.JWT_SECRET || process.env.SESSION_SECRET,
  // Token lifetime — mirrors the session cookie maxAge (7 days).
  jwtExpiresIn: '7d'
}