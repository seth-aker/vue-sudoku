import { SudokuPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";
// import mongoose from "mongoose";
// import { ObjectId, OptionalId } from "mongodb";

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
export interface ISqliteUser {
  user_id: number,
  name?: string,
  email: string,
  email_verified: boolean,
  password_hash?: Uint8Array,
  salt?: Uint8Array,
  image_url?: string,
  current_puzzle?: string,
  created_at: string,
  updated_at: string,
  deleted_at: string | null
}

// export interface IMongoUser extends Omit<IUser, '_id' | 'puzzlesPlayed'> {
//   _id: ObjectId,
//   puzzlesPlayed: ObjectId[]
// }
// export interface IUpdateMongoUser extends Partial<IMongoUser> {};
