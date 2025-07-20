import { CustomError } from "./customError";
import { ZodError } from 'zod/v4'

export class ValidationError extends CustomError {
  statusCode = 400;
  constructor(public error: ZodError<any>) {
    super();
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
