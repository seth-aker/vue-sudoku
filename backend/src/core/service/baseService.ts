import { CustomError } from "../errors/customError";
import { GenericError } from "../errors/genericError";

export class BaseDataSource {
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
