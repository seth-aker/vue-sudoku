import { Request } from "express";
import { Difficulty } from "../datasource/models/difficulty.ts";

export interface QueryOptions {
  difficulty?: Difficulty['rating'];
}
export interface SudokuRequest extends Request<{}, {}, {}, QueryOptions> {}
