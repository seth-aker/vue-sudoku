import { CustomError } from "./customError";

export class DatabaseError extends CustomError {
    statusCode = 500;

    // constructor(public error: Error) {
    //   super();
    //   Object.setPrototypeOf(this, DatabaseError.prototype);
    //   this.message = `[DatabaseError] ${error.message}`
    // }
    constructor(message: String) {
      super();
      Object.setPrototypeOf(this, DatabaseError.prototype);
      this.message = `[DatabaseError] ${message}`
    }

}
