import { Database } from "better-sqlite3";
import { UserDataSource } from "./userDataSource";
import { CreateUser, IUser, UpdateUser } from "./models/user";

export class SqliteUserDataSource implements UserDataSource {
  static instance: SqliteUserDataSource | null = null;
  private db: Database | null = null;
  constructor(db: Database) {
    this.db = db;
  }
  createUser: (user: CreateUser) => Promise<IUser>;
  getUser: (userId: string) => Promise<IUser>;
  getUserByAuthId: (auth0_id: string) => Promise<IUser>;
  updateUser: (userId: string, user: UpdateUser) => Promise<number>;
  deleteUser: (userId: string) => Promise<number>;
}