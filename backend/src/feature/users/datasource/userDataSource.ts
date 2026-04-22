// import { CreateUser, UpdateUser, IUser } from "./models/user"

import { ISqliteCreateUser, ISqliteUser } from "./models/user";

export interface UserDataSource {
  createUser: (user: ISqliteCreateUser) => Promise<string | undefined>;
  getUser: (userId: string) => Promise<ISqliteUser>;
  // updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
