import { db } from "@/core/dataSource/sqlite3";
import { SqliteUserDataSource } from "../datasource/sqliteUserDataSource";
import { UserServiceImplementation } from "../service/userServiceImplementation";
import { UserRouter } from "./userRouter";

const userDataSource =  SqliteUserDataSource.create(db)
const userService = UserServiceImplementation.create(userDataSource)
export const userRouter = UserRouter(userService)
