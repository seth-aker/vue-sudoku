import { AuthRouter } from "./authRouter";
import { AuthenticationServiceImpl } from "../service/authenticationServiceImpl";
import { db } from "@/core/dataSource/sqlite3";
import { SqliteUserDataSource } from "@/feature/users/datasource/sqliteUserDataSource";
const userDataSource = SqliteUserDataSource.create(db)
const authService = AuthenticationServiceImpl.create(db, userDataSource)
export const authRouter = AuthRouter(authService)