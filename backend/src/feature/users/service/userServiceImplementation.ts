import { BaseService } from "@/core/service/baseService";
import { UserService } from "./userService";
import { UserDataSource } from "../datasource/userDataSource";
import { ISqliteCreateUser } from "../datasource/models/user";

export class UserServiceImplementation extends BaseService implements UserService {
  private userDataSource: UserDataSource;
  private constructor(dataSource: UserDataSource) {
    super();
    this.userDataSource = dataSource;
  }
  static instance: UserService | null = null;
  static create(dataSource: UserDataSource) {
    if(UserServiceImplementation.instance === null) {
      UserServiceImplementation.instance = new UserServiceImplementation(dataSource);
    }
    return UserServiceImplementation.instance;
  }
  async createUser(user: ISqliteCreateUser) {
    return await this.callDataSource(async () => {
      
    })
  }
  async getUser(userId: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.getUser(userId);
    })
  }
  async deleteUser(userId: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.deleteUser(userId);
    })
  }
}
