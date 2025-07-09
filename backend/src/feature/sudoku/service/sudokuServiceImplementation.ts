import { SudokuDataSource } from "../datasource/sudokuDataSource";
import { SudokuService } from "./sudokuService";

export class SudokuServiceImplementation implements SudokuService {
  private sudokuDataSource: SudokuDataSource;
  private constructor(dataSource: SudokuDataSource) {
    
  }
}
