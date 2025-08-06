import { CustomError } from "./customError.ts";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message: string) {
    super();
    this.message = `[Not Found] ${message}`
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
