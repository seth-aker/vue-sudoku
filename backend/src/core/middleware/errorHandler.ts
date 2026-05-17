import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ZodError as ZodErrorV4 } from "zod/v4";
import { CustomError } from "../errors/customError";
import { ValidationError } from "../errors/validationError";

interface ErrorBody {
  message: string
  /** Only present for validation errors. Shape: zod's compact issue array. */
  issues?: unknown
}

/**
 * Global JSON error handler. Mounted LAST so it catches anything routes pass to next(err)
 * or throw inside an async handler that wraps in .catch(next).
 *
 * Mapping:
 *   - ZodError (v3 or v4) and our ValidationError → 400 with issues
 *   - CustomError subclasses → their statusCode + sanitized message
 *   - Everything else → 500 with a generic message (real error logged server-side)
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // ZodError can arrive directly (some validators throw the raw error) or
  // wrapped in our ValidationError. Handle both.
  if (err instanceof ValidationError) {
    const body: ErrorBody = {
      message: 'Validation failed',
      issues: err.error.issues,
    }
    return res.status(400).json(body)
  }
  if (err instanceof ZodError || err instanceof ZodErrorV4) {
    const body: ErrorBody = {
      message: 'Validation failed',
      issues: err.issues,
    }
    return res.status(400).json(body)
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  // Fallback. Log the real error server-side; don't leak details to clients.
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err)
  return res.status(500).json({ message: 'Internal Server Error' })
}
