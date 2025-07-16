import { SudokuDataSource } from "../datasource/sudokuDataSource";
import { PuzzleArray } from "../datasource/models/puzzleArray";
import PuzzleOptions from "../datasource/models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../datasource/models/sudokuPuzzle";
import { SudokuService } from "./sudokuService";
import { BaseService } from "../../../core/service/baseService";

export class SudokuServiceImplementation extends BaseService implements SudokuService {
  private sudokuDataSource: SudokuDataSource;
  private constructor(dataSource: SudokuDataSource) {
    super();
    this.sudokuDataSource = dataSource;
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
      return await this.sudokuDataSource.getPuzzle(requestedBy, options)
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
  async createPuzzle(puzzle: CreatePuzzle): Promise<SudokuPuzzle> {
    return await this.callDataSource(async () => {
      return await this.sudokuDataSource.createPuzzle(puzzle);
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
