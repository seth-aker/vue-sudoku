import dotenv from 'dotenv'
import process from "node:process";
dotenv.config();

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('Invalid/Missing environment variable: "DB_CONNECTION_STRING"')
}

export const config = {
  port: process.env.PORT || 3666,
  dbConnectionString: process.env.DB_CONNECTION_STRING,
  dbName: process.env.DB_NAME || 'dev',
  issuerBaseUrl: process.env.ISSUER_BASE_URL || 'https://dev-sethaker.us.auth0.com/',
  origin: process.env.ORIGIN || 'http://localhost:5173',
  audience: process.env.AUDIENCE || 'http://localhost:3666',
  rootDir: process.cwd(),
}
