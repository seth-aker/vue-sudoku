import { BaseService } from "@/core/service/baseService";
import { UserService } from "./userService";
import { UserDataSource } from "../datasource/userDataSource";
import { ISqliteCreateUser, ISqliteUser, IUserDTO } from "../datasource/models/user";

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
      // userDataSource throws if user isn't defined so user will always be defined here
      const user = await this.userDataSource.getUser(userId);
      return this.serializeUser(user)
    })
  }
  async deleteUser(userId: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.deleteUser(userId);
    })
  }

  private serializeUser(sqliteUser: ISqliteUser) {
    const userDTO: IUserDTO = {
      id: sqliteUser.user_id.toString(),
      name: sqliteUser.name,
      email: sqliteUser.email, 
      role: sqliteUser.role, 
      imageUrl: sqliteUser.image_url,
      currentPuzzleId: sqliteUser.current_puzzle
    }
    return userDTO;
  }
}
