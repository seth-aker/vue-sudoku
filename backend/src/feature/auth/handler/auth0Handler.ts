import { auth } from "express-oauth2-jwt-bearer";
import { auth0Config } from "../config/auth0Config";

export const auth0Handler = auth(auth0Config)