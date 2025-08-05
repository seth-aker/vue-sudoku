import { CreateUser, UpdateUser, User } from "./models/user"

export interface UserDataSource {
  createUser: (user: CreateUser) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
