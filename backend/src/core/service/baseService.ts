import { CustomError } from "../errors/customError.ts";
import { GenericError } from "../errors/genericError.ts";

export class BaseService {
  async callDataSource<T>(callBack: () => Promise<T>): Promise<T> {
    try {
      return await callBack();
    } catch (err) {
      if(err instanceof CustomError) {
        throw err
      }
      throw new GenericError(`${this.constructor.name} error`)
    }
  }
}
