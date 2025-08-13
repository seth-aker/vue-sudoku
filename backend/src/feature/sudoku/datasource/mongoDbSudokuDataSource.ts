import { Db, MongoClient, ObjectId, OptionalId } from 'mongodb'
import { type SudokuDataSource } from "./sudokuDataSource.ts";
import { type PuzzleOptions} from "./models/puzzleOptions.ts";
import { type CreatePuzzle, type SudokuPuzzle, type SudokuPuzzleResponse, type UpdatePuzzle } from "./models/sudokuPuzzle.ts";
import { config } from "../../../core/config/index.ts";
import { DatabaseError } from "../../../core/errors/databaseError.ts";
import { NotFoundError } from "../../../core/errors/notFoundError.ts";
import { type PuzzleArray } from "./models/puzzleArray.ts";
import { type IUser } from '@/feature/users/datasource/models/user.ts';

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

  async getNewPuzzle(requestedBy: string, options: PuzzleOptions): Promise<SudokuPuzzleResponse> {
      const db = this.connect();
      const puzzles = db.collection<SudokuPuzzle>('puzzles');
      const users = db.collection<IUser>('users');
      let user = {
        puzzlesPlayed: []
      } as IUser;
      if(requestedBy !== '') {
        user = await users.findOne({'auth0_id': requestedBy});
        if(!user.puzzlesPlayed) {
          user.puzzlesPlayed = []
        }
      }
      const result = await puzzles.aggregate<SudokuPuzzleResponse>([
        { $match: {
          _id: {
            $nin: user.puzzlesPlayed 
          },
          'difficulty.rating': options.difficulty
        }},
        { $facet: {
          metadata: [{ $count: 'totalCount'}],
          puzzle: [{ $sample: {size: 1}}]
        }}
      ]).next();
      const response = { puzzle: result.puzzle?.[0], metadata: result.metadata?.[0]}
      if(!response?.puzzle) {
        throw new DatabaseError("No more puzzles")
      }
      user.currentPuzzle = response.puzzle;
      user.puzzlesPlayed.push(response.puzzle._id)
      if(user._id) {
        const res = await users.updateOne({_id: user._id }, {$set: { currentPuzzle: user.currentPuzzle, puzzlesPlayed: user.puzzlesPlayed}});
        if(!res.acknowledged) {
          throw new DatabaseError("Failed to retrieve puzzle")
        }
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
    const coll = db.collection('puzzles');
    const transformedPuzzles = puzzles.map((puzzle) => {
      return {...puzzle, cells: puzzle.cells.map((row) => {
        return row.map((cell) => {
          return {...cell, candidates: Array.from(cell.candidates)}
        })
      })}
    })
    const response = await coll.insertMany(transformedPuzzles);
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
