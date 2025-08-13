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
export interface IUser {
  _id: string,
  name?: string,
  email?: string,
  image?: string,
  auth0_id: string; 
  puzzlesPlayed: string[];
  currentPuzzle: SudokuPuzzle,
}
export interface CreateUser extends OptionalId<IUser> {}
export interface UpdateUser extends Partial<Omit<IUser, '_id'>> {};

export interface IMongoUser extends Omit<IUser, '_id' | 'puzzlesPlayed'> {
  _id: ObjectId,
  puzzlesPlayed: ObjectId[]
}
export interface IUpdateMongoUser extends Partial<IMongoUser> {};