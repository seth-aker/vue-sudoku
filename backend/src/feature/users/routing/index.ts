import { db } from "@/core/dataSource/sqlite3";
import { SqliteUserDataSource } from "../datasource/sqliteUserDataSource";
import { UserServiceImplementation } from "../service/userServiceImplementation";
import { UserRouter } from "./userRouter";
// import mongoDbClient from '@/core/dataSource/mongoDbClient.ts'
import auth0RequireAuth from '@/feature/auth/middleware/auth0RequireAuth'
// const userDataSource = new MongoDbUserDataSource(mongoDbClient)
const userDataSource = new SqliteUserDataSource(db)
const userService = UserServiceImplementation.create(userDataSource)
const requireAuth = auth0RequireAuth

export const userRouter = UserRouter(userService, requireAuth)
