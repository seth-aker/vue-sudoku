import passport from "passport";
import { Strategy } from "passport-local";
import { AuthenticationDataSource } from "../datasource/authenticationDataSource";
import { db } from "@/core/dataSource/sqlite3";
export function registerLocalStrategy() {
  const dataSource = AuthenticationDataSource.create(db)
  passport.use(new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true
  },
  dataSource?.verify!
))
}
