import { CustomError } from "./customError.ts";
import { ZodError } from 'zod/v4'

export class ValidationError extends CustomError {
  statusCode = 400;
  constructor(public error: ZodError<unknown>) {
    super();
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
