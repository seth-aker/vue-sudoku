import { SudokuPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";
import mongoose from "mongoose";
import { ObjectId, OptionalId } from "mongodb";

// const userSchema = new mongoose.Schema({
//   auth0_id: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   name: {
//     type: String
//   },
//   puzzlesPlayed: [mongoose.Schema.Types.ObjectId],
//   currentPuzzle: sudokuPuzzleSchema,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// })

// export const UserModel = mongoose.model('user', userSchema);
export interface User {
  _id: ObjectId | string,
  name?: string,
  email?: string,
  image?: string,
  auth0_id: string; 
  puzzlesPlayed: ObjectId[];
  currentPuzzle: SudokuPuzzle,
}
export interface CreateUser extends OptionalId<User> {}
export interface UpdateUser extends Partial<User> {};

