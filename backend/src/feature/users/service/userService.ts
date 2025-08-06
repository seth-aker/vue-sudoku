import { UpdateUser, User } from "../datasource/models/user";

export interface UserService {
  getUser: (userId: string) => Promise<User>;
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
