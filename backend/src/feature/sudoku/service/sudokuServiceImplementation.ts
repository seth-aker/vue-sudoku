import { SudokuDataSource } from "../datasource/sudokuDataSource";
import { PuzzleArray } from "../datasource/models/puzzleArray";
import PuzzleOptions from "../datasource/models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../datasource/models/sudokuPuzzle";
import { SudokuService } from "./sudokuService";
import { BaseService } from "../../../core/service/baseService";
import { WorkerPoolManager } from "@/core/workers/workerpoolManager";
export class SudokuServiceImplementation extends BaseService implements SudokuService {
  private sudokuDataSource: SudokuDataSource;
  private workerpoolManager: WorkerPoolManager;
  private constructor(dataSource: SudokuDataSource) {
    super();
    this.sudokuDataSource = dataSource;
    this.workerpoolManager = new WorkerPoolManager();
  }
  static instance: SudokuService | null = null;
  static create(dataSource: SudokuDataSource) {
    if(SudokuServiceImplementation.instance === null) {
      SudokuServiceImplementation.instance = new SudokuServiceImplementation(dataSource);
    }
    return SudokuServiceImplementation.instance
  }

  async getPuzzle(requestedBy: string, options: PuzzleOptions): Promise<SudokuPuzzle>{
    return await this.callDataSource(async () => {
      const response = await this.sudokuDataSource.getPuzzle(requestedBy, options);
      if(response.metadata.totalCount < 100) {
        this.workerpoolManager.execute<CreatePuzzle[]>('generatePuzzles', [20, {difficulty: {rating: options.difficulty.rating}} as PuzzleOptions])
      }
      return response.puzzle
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
