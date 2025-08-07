import { User } from "../../datasource/models/user";
declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}