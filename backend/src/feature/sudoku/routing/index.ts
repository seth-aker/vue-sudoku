import client from "../../../core/dataSource/mongoDbClient.ts"
import { MongoDbSudokuDataSource } from "../datasource/mongoDbSudokuDataSource.ts";
import { SudokuServiceImplementation } from "../service/sudokuServiceImplementation.ts";
import SudokuRouter from "./sudokuRouter.ts";

const mongoDbSudokuDataSource = MongoDbSudokuDataSource.create(client);

const dataService = SudokuServiceImplementation.create(mongoDbSudokuDataSource);

export const sudokuRouter = SudokuRouter(dataService)
