import { Db, MongoClient, ObjectId } from 'mongodb'
import { SudokuDataSource } from "./sudokuDataSource";
import PuzzleOptions from "./models/puzzleOptions";
import { CreatePuzzle, SudokuPuzzle, SudokuPuzzleResponse, UpdatePuzzle } from "./models/sudokuPuzzle";
import { config } from "../../../core/config/index";
import { DatabaseError } from "../../../core/errors/databaseError";
import { NotFoundError } from "../../../core/errors/notFoundError";
import { PuzzleArray } from "./models/puzzleArray";
import { User } from '@/feature/users/datasource/models/user';

export class MongoDbSudokuDataSource implements SudokuDataSource {
  static instance: MongoDbSudokuDataSource | null = null;
  private client: MongoClient;
  private db: Db | null = null;

  constructor(client: MongoClient) {
    this.client = client;
  }
  static create(db: MongoClient) {
    if(MongoDbSudokuDataSource.instance === null) {
      MongoDbSudokuDataSource.instance = new MongoDbSudokuDataSource(db)
    }
    return MongoDbSudokuDataSource.instance
  }

  async getPuzzle(requestedBy: string, options: PuzzleOptions): Promise<SudokuPuzzleResponse> {
      const db = this.connect();
      const puzzles = db.collection<SudokuPuzzle>('puzzles');
      const users = db.collection<User>('users');
      const user = await users.findOne({'_id': new ObjectId(requestedBy)})
      const response = await puzzles.aggregate<SudokuPuzzleResponse>([
        { $match: {
          _id: {
            $nin: user.puzzlesPlayed
          },
          difficulty: options.difficulty
        }},
        { $facet: {
          metadata: [{ $count: 'totalCount'}, {}],
          puzzle: [{ $sample: {size: 1}}]
        }}
      ]).next();
      if(!response?.puzzle) {
        throw new DatabaseError("No more puzzles")
      }
      user.currentPuzzle = response.puzzle;
      user.puzzlesPlayed.push(response.puzzle._id)
      const res = await users.updateOne({_id: user._id }, user);
      if(!res.acknowledged) {
        throw new DatabaseError("Failed to retrieve puzzle")
      }
      return response
  }

  async getPuzzleById(requestedBy: string, puzzleId: string): Promise<SudokuPuzzle> {
      const db = this.connect();
      const coll = db.collection<SudokuPuzzle>('puzzles');
      const response = await coll.findOne({_id: new ObjectId(puzzleId)});
      if(!response) {
        throw new NotFoundError(`Puzzle with id: '${puzzleId}' not found`);
      }
      return response
  }
  async getPuzzles(options: PuzzleOptions, page: number = 1, limit: number = 20): Promise<PuzzleArray> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.aggregate<PuzzleArray>([
      {
        $match: {
           difficulty: options.difficulty 
        }
      },  
      {   
        $sort: { 
            difficulty: 1
        }  
      },
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          puzzles: [{ $skip: (page - 1) * limit }, { $limit: limit}],
        },
      },
    ]).next();

    if(!response) {
      throw new DatabaseError("Error retrieving puzzles")
    }
    return response
  }

  async createPuzzles(puzzles: CreatePuzzle[]): Promise<number> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.insertMany(puzzles as SudokuPuzzle[]);
    if(!response.acknowledged || !response.insertedIds) {
      throw new DatabaseError("Error saving puzzle")
    }
    return response.insertedCount;
  }

  async updatePuzzle(puzzle: UpdatePuzzle): Promise<number> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.updateOne({_id: puzzle._id}, {$set: puzzle});
    if(!response.acknowledged || response.modifiedCount !== 1) {
      throw new DatabaseError(`Error updating puzzle with id: ${puzzle._id}`);
    }
    return response.modifiedCount;
  }

  async deletePuzzle(puzzleId: string | ObjectId): Promise<number> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.deleteOne({_id: new ObjectId(puzzleId)});
    if(!response.acknowledged || response.deletedCount !== 1) {
      throw new DatabaseError(`Error deleting puzzle: ${puzzleId}`)
    }
    return response.deletedCount
  }

  
  private connect() {
    try {
      if(!this.db) {
        this.db = this.client.db(config.dbName)
      }
      return this.db
    } catch(err) {
      throw new DatabaseError(err?.message ?? 'Error connecting to database.')
    }
  }
}
