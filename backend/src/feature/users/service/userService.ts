import { CreateUser, UpdateUser, MongoUser, FrontendUser } from "../datasource/models/user";

export interface UserService {
  createUser: (user: CreateUser) => Promise<FrontendUser>;
  getUser: (userId: string) => Promise<FrontendUser>;
  getUserByAuthId: (auth0_id: string) => Promise<FrontendUser>
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
