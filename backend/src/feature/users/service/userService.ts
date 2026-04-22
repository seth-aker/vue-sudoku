import { ISqliteCreateUser, ISqliteUser } from "../datasource/models/user";

export interface UserService {
  // createUser: (user: ICreateUser) => Promise<ISqliteUser>;
  getUser: (userId: string) => Promise<ISqliteUser>;
  // updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
