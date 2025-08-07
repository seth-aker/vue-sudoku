import { MongoDbUserDataSource } from "../datasource/mongoDbUserDataSource";
import { UserServiceImplementation } from "../service/userServiceImplementation";
import { UserRouter } from "./userRouter";
import mongoDbClient from '@/core/dataSource/mongoDbClient.ts'
import auth0RequireAuth from '@/feature/auth/middleware/auth0RequireAuth'
const userDataSource = new MongoDbUserDataSource(mongoDbClient)
const userService = UserServiceImplementation.create(userDataSource)
const requireAuth = auth0RequireAuth

export const userRouter = UserRouter(userService, requireAuth)
