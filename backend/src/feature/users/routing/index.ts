import { db } from "@/core/dataSource/sqlite3";
import { SqliteUserDataSource } from "../datasource/sqliteUserDataSource";
import { UserServiceImplementation } from "../service/userServiceImplementation";
import { UserRouter } from "./userRouter";
// import mongoDbClient from '@/core/dataSource/mongoDbClient.ts'
// const userDataSource = new MongoDbUserDataSource(mongoDbClient)
const userDataSource = new SqliteUserDataSource(db)
const userService = UserServiceImplementation.create(userDataSource)
// export const userRouter = UserRouter(userService, requireAuth)
