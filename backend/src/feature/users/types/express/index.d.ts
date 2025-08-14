import { IUser } from "../../datasource/models/user";
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}
