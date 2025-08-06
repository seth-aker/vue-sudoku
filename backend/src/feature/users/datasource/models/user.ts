import { type CurrentPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";
import { type User as AuthUser } from "@auth/express";
import { ObjectId } from "mongodb";
export interface User extends Omit<AuthUser, 'id'> {
  _id: ObjectId | string,
  puzzlesPlayed: ObjectId[];
  currentPuzzle: CurrentPuzzle,
}
export interface CreateUser extends Omit<User, '_id'> {}
export interface UpdateUser extends Partial<User> {};

