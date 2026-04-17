import { Database } from "better-sqlite3";
import { UserDataSource } from "./userDataSource";
import { CreateUser, IUser, UpdateUser } from "./models/user";
import { DatabaseError } from "@/core/errors/databaseError";

export class SqliteUserDataSource implements UserDataSource {
  static instance: SqliteUserDataSource | null = null;
  private db: Database | null = null;
  constructor(db: Database) {
    this.db = db;
  }
  async createUser(user: CreateUser): Promise<IUser> {
    throw new DatabaseError("Function createUser not implemented")
  }
  async getUser(userId: string) : Promise<IUser> {
    throw new DatabaseError("Function getUser not implemented")
  }
  async getUserByAuthId (auth0_id: string) : Promise<IUser> {
    throw new DatabaseError("Function getUserByAuthId not implemented")
  }
  async updateUser (userId: string, user: UpdateUser) :Promise<number> {
    throw new DatabaseError("Function updateUser not implemented")
  }
  async deleteUser (userId: string) : Promise<number> {
    throw new DatabaseError("Function deleteUser not implemented")
  }
}