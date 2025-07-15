import { client } from '../datasource/mongoDbClient'
import { MongoDbSudokuDataSource } from '../datasource/mongoDbSudokuDataSource';
import { SudokuServiceImplementation } from '../service/sudokuServiceImplementation';
import SudokuRouter from './sudokuRouter';

const mongoDbSudokuDataSource = MongoDbSudokuDataSource.create(client);

const dataService = SudokuServiceImplementation.create(mongoDbSudokuDataSource);

export const sudokuRouter = SudokuRouter(dataService)