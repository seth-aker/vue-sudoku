import { CreateUser, UpdateUser, MongoUser } from "./models/user"

export interface UserDataSource {
  createUser: (user: CreateUser) => Promise<MongoUser>;
  getUser: (userId: string) => Promise<MongoUser>;
  getUserByAuthId: (auth0_id: string) => Promise<MongoUser>
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}
