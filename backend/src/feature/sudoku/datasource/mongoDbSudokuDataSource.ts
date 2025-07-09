import { MongoClient } from 'mongodb'
import { SudokuDataSource } from './sudokuDataSource';
import PuzzleOptions from '../models/puzzleOptions';
import { SudokuPuzzle } from '../models/sudokuPuzzle';
import { config } from '../../../core/config';
import { DataBaseError } from '../../../core/errors/databaseError';
export class MongoDbSudokuDataSource implements SudokuDataSource {
  static instance: MongoDbSudokuDataSource | null = null;
  private client: MongoClient
  constructor(db: MongoClient) {
    this.client = db;
  }
  static create(db: MongoClient) {
    if(MongoDbSudokuDataSource.instance === null) {
      MongoDbSudokuDataSource.instance = new MongoDbSudokuDataSource(db)
    }
    return MongoDbSudokuDataSource.instance
  }

  async getPuzzle(requestedBy: string, options: PuzzleOptions): Promise<SudokuPuzzle> {
    try {
      const db = this.connect();
      const coll = db.collection<SudokuPuzzle>('puzzles');
      const response = await coll.aggregate<SudokuPuzzle>([
        { $match: {
          $not: [{
            $in: [requestedBy, "$requestedBy"]
          }]
        }},
        { $sample: {size: 1}}
      ]).next();
      if(!response) {
        throw new DataBaseError(new Error("No more puzzles"))
      }
      response.usedBy.push(requestedBy);
      
    }
    
  }

  private connect() {
    try {
      return this.client.db(config.dbName)
    } catch(err) {
      throw new DataBaseError(err)
    }
  }
}
