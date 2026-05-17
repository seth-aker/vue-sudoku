export { apiFetch, setOnUnauthorized, type ApiResult, type ApiFetchOptions } from './client'
export { getToken, setToken, clearToken } from './tokenStorage'

export * as userService from './services/userService'
export * as sudokuService from './services/sudokuService'

export type {
  UserDTO,
  TokenResponse,
  DifficultyStats,
} from './services/userService'
export type {
  NewPuzzleResponse,
  UserPuzzleResponse,
  UpdatePuzzleBody,
} from './services/sudokuService'
