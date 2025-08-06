import { MongoDbUserDataSource } from "../datasource/mongoDbUserDataSource";
import { UserServiceImplementation } from "../service/userServiceImplementation";
import { UserRouter } from "./userRouter";
import mongoDbClient from '@/core/dataSource/mongoDbClient.ts'
const userDataSource = new MongoDbUserDataSource(mongoDbClient)
const userService = UserServiceImplementation.create(userDataSource)

export const userRouter = UserRouter(userService)
