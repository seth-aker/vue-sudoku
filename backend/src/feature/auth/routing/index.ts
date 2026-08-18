import { AuthRouter } from "./authRouter";
import { AuthenticationServiceImpl } from "../service/authenticationServiceImpl";
import { PgUserDataSource } from "@/feature/users/datasource/pgUserDataSource";
import sql from "@/core/dataSource/postgres";
import { PgTokenStore } from "../datasource/pgTokenStore";

const userDataSource = PgUserDataSource.create(sql)
const tokenDataSource = PgTokenStore.create(sql)
const authService = AuthenticationServiceImpl.create(sql, userDataSource, tokenDataSource)
export const authRouter = AuthRouter(authService)
