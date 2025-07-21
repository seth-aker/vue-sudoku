import { Db, MongoClient, ObjectId } from 'mongodb'
import { SudokuDataSource } from "./sudokuDataSource.ts";
import PuzzleOptions from "./models/puzzleOptions.ts";
import { CreatePuzzle, SudokuPuzzle, SudokuPuzzleResponse, UpdatePuzzle } from "./models/sudokuPuzzle.ts";
import { config } from "../../../core/config/index.ts";
import { DatabaseError } from "../../../core/errors/databaseError.ts";
import { NotFoundError } from "../../../core/errors/notFoundError.ts";
import { PuzzleArray } from "./models/puzzleArray.ts";

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
      const coll = db.collection<SudokuPuzzle>('puzzles');
      const response = await coll.aggregate<SudokuPuzzleResponse>([
        { $match: {
          $not: [{
            $in: [requestedBy, "$requestedBy"]
          }],
        }},
        { $facet: {
          metadata: [{ $count: 'totalCount'}, {}],
          puzzle: [{ $sample: {size: 1}}]
        }}
      ]).next();
      if(!response?.puzzle) {
        throw new DatabaseError(new Error("No more puzzles"))
      }
      response.puzzle.usedBy.push(new ObjectId(requestedBy));
      const res = await coll.updateOne({_id: response.puzzle._id}, response.puzzle);
      if(!res.acknowledged) {
        throw new DatabaseError(new Error("Failed to retrieve puzzle"))
      }
      return response
  }

  async getPuzzleById(requestedBy: string, puzzleId: string): Promise<SudokuPuzzle> {
      const db = this.connect();
      const coll = db.collection<SudokuPuzzle>('puzzles');
      const response = await coll.findOne({_id: puzzleId});
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
      throw new DatabaseError(new Error("Error retrieving puzzles"))
    }
    return response
  }

  async createPuzzle(puzzle: CreatePuzzle): Promise<SudokuPuzzle> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.insertOne(puzzle as SudokuPuzzle);
    if(!response.acknowledged || !response.insertedId) {
      throw new DatabaseError(new Error("Error saving puzzle"))
    }
    (puzzle as SudokuPuzzle)._id = response.insertedId;
    return puzzle as SudokuPuzzle
  }

  async updatePuzzle(puzzle: UpdatePuzzle): Promise<number> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.updateOne({_id: puzzle._id}, {$set: puzzle});
    if(!response.acknowledged || response.modifiedCount !== 1) {
      throw new DatabaseError(new Error(`Error updating puzzle with id: ${puzzle._id}`));
    }
    return response.modifiedCount;
  }

  async deletePuzzle(puzzleId: string | ObjectId): Promise<number> {
    const db = this.connect();
    const coll = db.collection<SudokuPuzzle>('puzzles');
    const response = await coll.deleteOne({_id: puzzleId});
    if(!response.acknowledged || response.deletedCount !== 1) {
      throw new DatabaseError(new Error(`Error deleting puzzle: ${puzzleId}`))
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
      throw new DatabaseError(err as Error)
    }
  }
}
