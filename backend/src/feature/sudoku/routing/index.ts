// import client from "../../../core/dataSource/mongoDbClient.ts"
// import { MongoDbSudokuDataSource } from "../datasource/mongoDbSudokuDataSource.ts";
import { SqliteSudokuDataSource } from "../datasource/sqliteSudokuDataSource.ts";
import { db } from '@/core/dataSource/sqlite3.ts'
import { SudokuServiceImplementation } from "../service/sudokuServiceImplementation.ts";
import SudokuRouter from "./sudokuRouter.ts";

// const mongoDbSudokuDataSource = MongoDbSudokuDataSource.create(client);
const sqliteSudokuDataSource = SqliteSudokuDataSource.create(db)
const dataService = SudokuServiceImplementation.create(sqliteSudokuDataSource);

export const sudokuRouter = SudokuRouter(dataService)
