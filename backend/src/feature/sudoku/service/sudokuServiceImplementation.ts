import { SudokuDataSource } from "../datasource/sudokuDataSource";
import { PuzzleArray } from "../datasource/models/puzzleArray";
import { type PuzzleOptions} from "../datasource/models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../datasource/models/sudokuPuzzle";
import { SudokuService } from "./sudokuService";
import { BaseService } from "../../../core/service/baseService";
import { WorkerPoolManager } from "@/core/workers/workerpoolManager";
import { DatabaseError } from "@/core/errors/databaseError";
import { config } from "@/core/workers/workerpoolConfig";
export class SudokuServiceImplementation extends BaseService implements SudokuService {
  private sudokuDataSource: SudokuDataSource;
  private workerpoolManager: WorkerPoolManager;
  private constructor(dataSource: SudokuDataSource) {
    super();
    this.sudokuDataSource = dataSource;
    this.workerpoolManager = new WorkerPoolManager();
    this.workerpoolManager.configure(config)
  }
  static instance: SudokuService | null = null;
  static create(dataSource: SudokuDataSource) {
    if(SudokuServiceImplementation.instance === null) {
      SudokuServiceImplementation.instance = new SudokuServiceImplementation(dataSource);
    }
    return SudokuServiceImplementation.instance
  }

  async getNewPuzzle(requestedBy: string, options: PuzzleOptions): Promise<SudokuPuzzle>{
    return await this.callDataSource(async () => {
      try {
        const response = await this.sudokuDataSource.getNewPuzzle(requestedBy, options);
        // console.log(response)
        if(response.metadata.totalCount < 100) {
          this.workerpoolManager.execute<CreatePuzzle[]>('generatePuzzles', [20, options])
          .then(async (newPuzzles) => {
              const result = await this.createPuzzles(newPuzzles);
              console.log(`${result} puzzles created!`)
            })
        }
        return response.puzzle

      } catch (err) {
        console.log(err.message)
        if(err instanceof DatabaseError && err.message.includes('No more puzzles')) {
          this.workerpoolManager.execute<CreatePuzzle[]>('generatePuzzles', [20, options])
            .then(async (newPuzzles) => {
              const result = await this.createPuzzles(newPuzzles);
              console.log(`${result} puzzles created!`)
            })
          
        } 
        throw err
      }
    });
  };
  async getPuzzleById(requestedBy: string, puzzleId: string): Promise<SudokuPuzzle> {
    return await this.callDataSource(async () => {
      return await this.sudokuDataSource.getPuzzleById(requestedBy, puzzleId);
    })
  }

  async getPuzzles(options: PuzzleOptions, page?: number, limit?: number): Promise<PuzzleArray>{
    return await this.callDataSource(async () => {
      return await this.sudokuDataSource.getPuzzles(options, page, limit);
    })
  };
  async createPuzzles(puzzles: CreatePuzzle[]): Promise<number> {
    return await this.callDataSource(async () => {
      return await this.sudokuDataSource.createPuzzles(puzzles);
    })
  };
  async updatePuzzle(puzzle: UpdatePuzzle): Promise<number> {
    return await this.callDataSource(async () => {  
      return await this.sudokuDataSource.updatePuzzle(puzzle)
    });
  };
  async deletePuzzle(puzzleId: string): Promise<number>{
    return await this.callDataSource(async () => {
      return await this.sudokuDataSource.deletePuzzle(puzzleId)
    });
  }
}
