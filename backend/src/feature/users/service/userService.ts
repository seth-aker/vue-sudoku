import { CreateUser, UpdateUser, User } from "../datasource/models/user";

export interface UserService {
  createUser: (user: CreateUser) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  getUserByAuthId: (auth0_id: string) => Promise<User>
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
