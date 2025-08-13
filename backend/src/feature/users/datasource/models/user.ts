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
export interface MongoUser {
  _id: ObjectId,
  name?: string,
  email?: string,
  image?: string,
  auth0_id: string; 
  puzzlesPlayed: ObjectId[];
  currentPuzzle: SudokuPuzzle,
}
export interface CreateUser extends OptionalId<MongoUser> {}
export interface UpdateUser extends Partial<MongoUser> {};

export interface FrontendUser extends Omit<MongoUser, '_id'> {
  _id: string
}
