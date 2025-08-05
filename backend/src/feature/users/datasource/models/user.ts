import { SudokuPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";
import { User as AuthUser } from "@auth/express";
import { ObjectId } from "mongodb";
export interface User extends Omit<AuthUser, 'id'> {
  _id: ObjectId | string,
  puzzlesPlayed: ObjectId[];
  currentPuzzle: SudokuPuzzle,
}
export interface CreateUser extends Omit<User, '_id'> {}
export interface UpdateUser extends Partial<User> {};

