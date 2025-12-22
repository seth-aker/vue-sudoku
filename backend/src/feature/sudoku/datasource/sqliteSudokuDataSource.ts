import { PuzzleArray } from "./models/puzzleArray";
import { PuzzleOptions } from "./models/puzzleOptions";
import { SudokuPuzzleResponse, SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "./models/sudokuPuzzle";
import { SudokuDataSource } from "./sudokuDataSource";
import type { Database, Statement } from "better-sqlite3";
import { DatabaseError } from "@/core/errors/databaseError";
import { Row } from "./models/row";
import { puzzleScripts, userPuzzleScripts } from "@/core/dataSource/sqlite3";
import { Cell } from "./models/cell";
import { Difficulty, DifficultyRating } from "./models/difficulty";
import { response } from "express";

interface SqlScripts {
  createPuzzle: Statement<{cells: string, difficultyScore: number, difficultyRating: string}>
  getUserPuzzle: Statement<{userId: string, puzzleId: string}, SqlUserPuzzle>,
  getPuzzleById: Statement<{puzzleId: string}, SqlPuzzle>,
  getPuzzleByDifficulty: Statement<{difficultyRating: string, userId: string}, SqlPuzzle & {total_count: number}>,
  updatePuzzle: Statement<{isCompleted: boolean, cells: string, candidates: string, time: string, userId: string, puzzleId: string}>,
  createUserPuzzle: Statement<{userId: string, puzzleId: string, isCompleted: boolean, cells: string, candidates: string}>
}

interface SqlPuzzle {
  puzzle_id: string,
  cells: string,
  difficulty_rating: string,
  difficulty_score: number
}
interface SqlUserPuzzle {
  puzzle_id: string,
  isCompleted: number,
  current_cells: string,
  current_candidates: string,
  time: string,
  original_cells: string,
  difficulty_rating: string,
  difficulty_score: string
}


export class SqliteSudokuDataSource implements SudokuDataSource {
  static instance: SqliteSudokuDataSource | null = null;
  private db: Database | null = null;
  private scripts: SqlScripts;
  constructor(db: Database) {
    this.db = db;
    this.prepareScripts();
  }
  static create(db: Database) {
    if(SqliteSudokuDataSource.instance === null) {
      SqliteSudokuDataSource.instance = new SqliteSudokuDataSource(db);
    }
    return SqliteSudokuDataSource.instance;
  }

  async getNewPuzzle(requestedBy: string | undefined, options: PuzzleOptions): Promise<SudokuPuzzleResponse> {
      const result = this.scripts.getPuzzleByDifficulty.get({difficultyRating: options.difficulty, userId: requestedBy ?? null});
      if(!result || result.total_count === 0) {
        throw new DatabaseError("No more puzzles")
      }
      if(requestedBy) {
        this.scripts.createUserPuzzle.run({
          userId: requestedBy,
          puzzleId: result.puzzle_id,
          isCompleted: false,
          cells: result.cells,
          candidates: ""
        })
      }
      const cells = this.deserializeCells(result.cells);
      const response: SudokuPuzzleResponse = {
         metadata: {
          totalCount: result.total_count
         },
         puzzle: {
          _id: result.puzzle_id,
          cells: cells,
          difficulty: {
            rating: result.difficulty_rating as DifficultyRating,
            score: result.difficulty_score
          }
         }
      }
      return response;
    
  }
  async getPuzzleById(requestedBy: string, puzzleId: string): Promise<SudokuPuzzle> {
    try {
      const result = this.scripts.getPuzzleById.get({
        puzzleId: puzzleId
      })
      const cells = this.deserializeCells(result.cells);
      return {
        _id: result.puzzle_id,
        cells,
        difficulty: {
          rating: result.difficulty_rating as DifficultyRating,
          score: result.difficulty_score
        }
      }
    } catch (err) {

    }
  }
  getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
  async createPuzzles(puzzles: CreatePuzzle[]): Promise<number> {
    puzzles.forEach((puzzle) => {
      const {cellString} = this.serializePuzzleCells(puzzle.cells)
      try {
        this.scripts.createPuzzle.all({
          cells: cellString, 
          difficultyScore: puzzle.difficulty.score ?? null, 
          difficultyRating: puzzle.difficulty.rating
        })
      } catch (err) {
        throw new DatabaseError(err.message);
      }
    })
    return puzzles.length;
  }
  updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
  deletePuzzle: (puzzleId: string) => Promise<number>;

  private serializePuzzleCells(cells: Row[]) {
    let cellString = ''
    const candidateArray: string[] = []
    cells.forEach((row) => {
      row.forEach((cell) => {
        cellString += cell.value ? cell.value.toString() : '0'
        candidateArray.push(Array.from(cell.candidates).join(""))
      })
    })
    const candidatesString = candidateArray.join(";")
    return {
      cellString,
      candidatesString
    }
  }
  private deserializeCells(cellString: string, candidatesString?: string) {
    const cells: Row[] = []
    const candidates: Set<number>[] = candidatesString ? this.deserializeCandidates(candidatesString) : [];
  
    if(cellString.length != 81) {
      throw new DatabaseError(`Puzzle Size is not 81 cells: Size ${cellString.length}`)
    }
    for(let r = 0; r < 9; r++) {
      const row: Cell[] = []
      for(let c = 0; c < 9; c++) {
        const cellIndex = r * 9 + c
        const cellValue = Number.parseInt(cellString.charAt(cellIndex));
        const cell: Cell = {
          cellId: `r${r}c${c}`,
          value: cellValue != 0 ? cellValue : undefined,
          candidates: candidatesString ? candidates[cellIndex] : new Set<number>(),
          type: cellValue > 0 ? 'prefilled': 'blank' 
        }
        row.push(cell)
      }
      cells.push(row)
    }
    return cells
  }
  private deserializeCandidates(candidatesString: string) {
    const raw = candidatesString.split(';')
    if(raw.length != 81) {
      throw new DatabaseError('Candidate Deserialization error: length not 81 cells')
    }
    const candidates = raw.map((candidateString) => {
      const candidates = candidateString.split('').map(each => Number.parseInt(each));
      return new Set<number>(candidates);
    })
    return candidates
  }
  private prepareScripts() {
    this.scripts = {
      createPuzzle: this.db.prepare(puzzleScripts.createPuzzle),
      getPuzzleById: this.db.prepare(puzzleScripts.getPuzzleById),
      createUserPuzzle: this.db.prepare(userPuzzleScripts.insertUserPuzzle),
      getUserPuzzle: this.db.prepare(userPuzzleScripts.getUserPuzzle),
      getPuzzleByDifficulty: this.db.prepare(puzzleScripts.getPuzzleByDifficulty),
      updatePuzzle: this.db.prepare(userPuzzleScripts.updateUserPuzzle)
    }
  }
}