import { MongoClient } from 'mongodb'
import { SudokuDataSource } from './sudokuDataSource';
import PuzzleOptions from '../models/puzzleOptions';
import { SudokuPuzzle } from '../models/sudokuPuzzle';

export class MongoDBDataSource implements SudokuDataSource {
  static instance: MongoDBDataSource | null = null;
  private client: MongoClient
  constructor(db: MongoClient) {
    this.client = db;
  }
  static create(db: MongoClient) {
    if(MongoDBDataSource.instance === null) {
      MongoDBDataSource.instance = new MongoDBDataSource(db)
    }
    return MongoDBDataSource.instance
  }

  async getPuzzle(requestedBy: string, options: PuzzleOptions): Promise<SudokuPuzzle> {
    this.client
  }


}
