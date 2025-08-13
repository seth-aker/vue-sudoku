import { CreateUser, UpdateUser, IUser } from "./models/user"

export interface UserDataSource {
  createUser: (user: CreateUser) => Promise<IUser>;
  getUser: (userId: string) => Promise<IUser>;
  getUserByAuthId: (auth0_id: string) => Promise<IUser>
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
