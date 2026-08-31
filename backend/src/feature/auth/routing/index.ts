import { AuthRouter } from "./authRouter";
import { AuthenticationServiceImpl } from "../service/authenticationServiceImpl";
import { PgUserDataSource } from "@/feature/users/datasource/pgUserDataSource";
import sql from "@/core/dataSource/postgres";
import { PgTokenDataSource } from "../datasource/pgTokenDataSource";

const userDataSource = PgUserDataSource.create(sql)
const tokenDataSource = PgTokenDataSource.create(sql)
const authService = AuthenticationServiceImpl.create(userDataSource, tokenDataSource)
export const authRouter = AuthRouter(authService)
