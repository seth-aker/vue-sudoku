import { NextFunction, Request, Response } from "express";
import { UserService } from "../service/userService";
import { CreateUser } from "../datasource/models/user";
import { SudokuPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";
import { parseAuthHeader } from "../utils/parseAuthHeader";

export function SyncUser(userService: UserService) {
    const syncUser = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const auth0Id = req?.auth?.payload?.sub ?? parseAuthHeader(req.headers.authorization).sub
            let user = await userService.getUserByAuthId(auth0Id);
            if(!user) {
                console.log(`Creating new user profile for ${auth0Id}`);
                const newUser: CreateUser = {
                    auth0_id: auth0Id,
                    currentPuzzle: {} as SudokuPuzzle,
                    puzzlesPlayed: []
                }
                user = await userService.createUser(newUser);
            }
            req.user = user
            next()
        } catch (err) {
            console.log(`[SyncUser] error in middleware `, err)
            next(err)
        }
    }
    return syncUser;
} 
