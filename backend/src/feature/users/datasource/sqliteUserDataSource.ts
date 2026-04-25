import { Database, Statement } from "better-sqlite3";
import { UserDataSource } from "./userDataSource";
import { ICreateUser, ISqlUser } from "./models/user";
import { DatabaseError } from "@/core/errors/databaseError";
import { userScripts } from "@/core/dataSource/sqlite3";

export interface IUserScripts {
  createUser: Statement<ICreateUser, {user_id: number}>
  getUser: Statement<{userId: string}, ISqlUser>
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
  async createUser(user: ICreateUser): Promise<string | undefined> {
    const res = this.scripts.createUser.get(user);
    if(!res) {
      throw new DatabaseError("An error occurred creating user with email: " + user.email)
    }
    return res.user_id.toString()
  }
  async getUser(userId: string) : Promise<ISqlUser> {
    const result = this.scripts.getUser.get({userId})
    if(!result) {
      throw new DatabaseError(`User with id: ${userId} not found`)
    }
    return result
  }
  async deleteUser (userId: string) : Promise<number> {
    throw new DatabaseError("Function deleteUser not implemented")
  }

  private prepareScripts() {
    const scripts = {
      createUser: this.db!.prepare(userScripts.insertUser),
      getUser: this.db?.prepare(userScripts.getUserById)
    }
    return scripts
  }
}
