import { CreateUser, UpdateUser, IUser } from "../datasource/models/user";

export interface UserService {
  createUser: (user: CreateUser) => Promise<IUser>;
  getUser: (userId: string) => Promise<IUser>;
  getUserByAuthId: (auth0_id: string) => Promise<IUser>
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
