import { ExpressAuth } from '@auth/express'
import { authConfig } from "../config/index";

export const ExpressAuthHandler = ExpressAuth(authConfig)
