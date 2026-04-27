import { Sql } from "postgres";
import { UserDataSource } from "./userDataSource";
import { ICreateUser, ISqlUser } from "./models/user";
import { DatabaseError } from "@/core/errors/databaseError";
import { SqlUserPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";

export class PgUserDataSource implements UserDataSource {
  static instance: PgUserDataSource | null = null;
  private client: Sql;
  private constructor(client: Sql) {
    this.client = client;
  }
  static create(client: Sql) {
    if(!PgUserDataSource.instance) {
      PgUserDataSource.instance = new PgUserDataSource(client);
    }
    return PgUserDataSource.instance;
  }

  async createUser(user: ICreateUser): Promise<string | undefined> {
    const [res] = await this.client<{user_id: string}[]>`
      INSERT INTO users (
        display_name,
        username,
        password_hash,
        salt
      )
      VALUES (
        ${user.displayName ?? null},
        ${user.username},
        ${user.passwordHash},
        ${user.salt}
      ) 
      RETURNING user_id;
    `
    return res.user_id;
  }
  async getUser(userId: string): Promise<ISqlUser & {current_puzzle: SqlUserPuzzle}> {
    const [user] = await this.client<(ISqlUser & {current_puzzle: SqlUserPuzzle})[]>`
     SELECT u.user_id,
        u.display_name,
        u.username,
        u.role,
        json_build_object(
          'puzzle_id', up.puzzle_id,
          'is_completed', up.is_completed,
          'current_cells', up.cells,
          'current_candidates', up.candidates,
          'time', up.time,
          'original_cells', p.cells,
          'difficulty_rating', p.difficulty_rating,
          'difficulty_score', p.difficulty_score,
          'actions', up.actions
        ) as current_puzzle,
        u.current_puzzle_id,
        u.image_url,
        u.created_at,
        u.updated_at
      FROM 
        users as u
      LEFT JOIN 
        user_puzzles as up ON up.puzzle_id = u.current_puzzle_id AND u.user_id = up.user_id
      LEFT JOIN
        puzzles AS p ON up.puzzle_id = p.puzzle_id
      WHERE 
        u.user_id = ${userId} 
        AND u.deleted_at IS NULL
    `
    if(!user) {
      throw new DatabaseError("User not found")
    }
    return user;
  }
  async deleteUser(userId: string): Promise<number> {
    const res = await this.client`
      UPDATE users
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `
    if(res.length) {
      return res.length
    } else {
      throw new DatabaseError('Failed to delete user')
    }
  }
}
