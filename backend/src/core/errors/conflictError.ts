import { CustomError } from "./customError.ts";

export class ConflictError extends CustomError {
  statusCode = 409;

  constructor(message: string) {
    super();
    Object.setPrototypeOf(this, ConflictError.prototype);
    this.message = `[Conflict] ${message}`;
  }
}
