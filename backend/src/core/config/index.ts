import dotenv from 'dotenv'
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
dotenv.config();

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('Invalid/Missing environment variable: "DB_CONNECTION_STRING"')
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Default worker path is resolved relative to this file so it works in any
 * checkout / install location. WORKER_PATH env var overrides if set.
 * `.ts` is correct in dev (tsx) and is rewritten to `.js` after `tsup` build.
 */
const defaultWorkerPath = path.resolve(__dirname, '../../feature/sudoku/puzzleSolver/puzzleGeneratorInC.ts')

export const config = {
  port: process.env.PORT || 3666,
  dbConnectionString: process.env.DB_CONNECTION_STRING,
  dbName: process.env.DB_NAME || 'dev',
  issuerBaseUrl: process.env.ISSUER_BASE_URL || 'https://dev-sethaker.us.auth0.com/',
  origin: process.env.ORIGIN || 'http://127.0.0.1:5173',
  audience: process.env.AUDIENCE || 'http://localhost:3666',
  rootDir: process.env.ROOT_DIR || process.cwd(),
  puzzleGeneratorWorkerPath: process.env.WORKER_PATH || defaultWorkerPath
}
