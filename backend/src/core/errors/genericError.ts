import { CustomError } from "./customError.ts";

export class GenericError extends CustomError {
    statusCode =  500;

    constructor(message: string) {
      super();
      Object.setPrototypeOf(this, GenericError.prototype);
      this.message = message;
    }
}
