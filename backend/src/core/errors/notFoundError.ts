import { CustomError } from "./customError";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message: string) {
    super();
    this.message = `[Not Found] ${message}`
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
