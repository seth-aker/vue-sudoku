import mongoose from "mongoose";
import { type Cell, cellSchema } from "./cell.ts";

export type Row = Cell[]

export const rowSchema = new mongoose.Schema<Row>([cellSchema])