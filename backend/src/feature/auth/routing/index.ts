import AuthRouter from "./authRouter.ts";
import { ExpressAuthHandler } from "../handler/expressAuthHandler.ts";

export default AuthRouter(ExpressAuthHandler)
