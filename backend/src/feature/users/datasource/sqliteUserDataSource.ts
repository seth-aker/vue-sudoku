import { Database, Statement } from "better-sqlite3";
import { UserDataSource } from "./userDataSource";
import { ISqliteCreateUser, ISqliteUser } from "./models/user";
import { DatabaseError } from "@/core/errors/databaseError";
import { userScripts } from "@/core/dataSource/sqlite3";

export interface IUserScripts {
  createUser: Statement<ISqliteCreateUser, number>
}

export class SqliteUserDataSource implements UserDataSource {
  static instance: SqliteUserDataSource | null = null;
  private db: Database | null = null;
  private scripts: IUserScripts
  private constructor(db: Database) {
    this.db = db;
    this.scripts = this.prepareScripts() as IUserScripts
  }
  static create(db: Database) {
    if(SqliteUserDataSource.instance === null) {
      SqliteUserDataSource.instance = new SqliteUserDataSource(db)
    }
    return SqliteUserDataSource.instance
  }
  async createUser(user: ISqliteCreateUser): Promise<string | undefined> {
    const result = this.scripts.createUser.get(user);
    if(!result) {
      throw new DatabaseError("An error occurred creating user with email: " + user.email)
    }
    return result.toString()
  }
  async getUser(userId: string) : Promise<ISqliteUser> {
    throw new DatabaseError("Function getUser not implemented")
  }
  // async updateUser (userId: string, user: UpdateUser) :Promise<number> {
  //   throw new DatabaseError("Function updateUser not implemented")
  // }
  async deleteUser (userId: string) : Promise<number> {
    throw new DatabaseError("Function deleteUser not implemented")
  }

  private prepareScripts() {
    const scripts = {
      createUser: this.db!.prepare(userScripts.insertUser)
    }
    return scripts
  }
}