import { BaseService } from "@/core/service/baseService";
import { UserService } from "./userService";
import { UserDataSource } from "../datasource/userDataSource";
import { ISqlUser, IUserDTO } from "../datasource/models/user";
import { SqlUserPuzzle } from "@/feature/sudoku/datasource/models/sudokuPuzzle";

export class UserServiceImplementation extends BaseService implements UserService {
  private userDataSource: UserDataSource;
  private constructor(userDataSource: UserDataSource) {
    super();
    this.userDataSource = userDataSource;
  }
  static instance: UserService | null = null;
  static create(userDataSource: UserDataSource) {
    if(UserServiceImplementation.instance === null) {
      UserServiceImplementation.instance = new UserServiceImplementation(userDataSource);
    }
    return UserServiceImplementation.instance;
  }
  async getUser(userId: string) {
    return await this.callDataSource(async () => {
      // userDataSource throws if user isn't defined so user will always be defined here
      const user = await this.userDataSource.getUser(userId);
      return this.serializeUser(user)
    })
  }
  async deleteUser(userId: string) {
    return await this.callDataSource(async () => {
      return await this.userDataSource.deleteUser(userId);
    })
  }

  private serializeUser(sqlUser: ISqlUser & {current_puzzle?: SqlUserPuzzle}) {
    const userDTO: IUserDTO = {
      id: sqlUser.user_id,
      displayName: sqlUser.display_name,
      username: sqlUser.username, 
      role: sqlUser.role, 
      imageUrl: sqlUser.image_url,
      currentPuzzle: sqlUser.current_puzzle ? {
        _id: sqlUser.current_puzzle.puzzle_id,
        currentCells: sqlUser.current_puzzle.current_cells,
        currentCandidates: sqlUser.current_puzzle.current_candidates,
        originalCells: sqlUser.current_puzzle.original_cells,
        time: sqlUser.current_puzzle.time,
        isCompleted: sqlUser.current_puzzle.is_completed,
        actions: sqlUser.current_puzzle.actions,
        difficulty: {
          score: sqlUser.current_puzzle.difficulty_score,
          rating: sqlUser.current_puzzle.difficulty_rating
        },
      } : undefined
    }
    return userDTO;
  }
}
