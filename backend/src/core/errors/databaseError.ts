import { CustomError } from './customError';

export class DataBaseError extends CustomError {
    statusCode = 500;

    constructor(public error: Error) {
      super();
      Object.setPrototypeOf(this, DataBaseError.prototype);
    }

    formatError(): { message: string; field?: string }[] {
        return [{message: 'Database error.'}];
    }

}
