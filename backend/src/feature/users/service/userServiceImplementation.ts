import { BaseService } from "@/core/service/baseService";
import { UserService } from "./userService";
import { UserDataSource } from "../datasource/userDataSource";
import { CreateUser, User } from "../datasource/models/user";

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
  async createUser(user: CreateUser) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.createUser(user);
    })
  }
  async getUser(userId: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.getUser(userId);
    })
  }
  async getUserByAuthId(auth0_id: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.getUserByAuthId(auth0_id)
    })
  }
  async updateUser(userId: string, user: User) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.updateUser(userId, user);
    })
  }
  async deleteUser(userId: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.deleteUser(userId);
    })
  }
}
