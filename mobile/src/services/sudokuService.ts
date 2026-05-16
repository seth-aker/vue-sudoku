import {
  Action,
  Cell,
  Difficulty,
  DifficultyRating,
  NewPuzzleDto,
  UpdateUserPuzzleDto,
  UserPuzzleDto,
  buildCells,
  candidatesToString,
  cellsToString,
  deserializeAction,
  serializeAction,
} from '@/src/domain';

import { ServiceResult, apiFetch } from './http';

export interface LoadedPuzzle {
  puzzleId: string;
  cells: Cell[];
  originalCells: Cell[];
  difficulty: Difficulty;
  actions: Action[];
  time: number;
  isCompleted: boolean;
}

export async function fetchNewPuzzle(
  difficulty: DifficultyRating,
): Promise<ServiceResult<LoadedPuzzle>> {
  const res = await apiFetch<NewPuzzleDto>(
    `/sudoku/new?difficulty=${difficulty}`,
  );
  if (!res.success || !res.body) {
    return { success: false, message: res.message };
  }
  const dto = res.body;
  return {
    success: true,
    body: {
      puzzleId: dto.puzzleId,
      cells: buildCells(dto.cells, undefined, dto.candidates),
      originalCells: buildCells(dto.cells),
      difficulty: dto.difficulty,
      actions: [],
      time: 0,
      isCompleted: false,
    },
  };
}

export async function fetchPuzzle(
  puzzleId: string,
): Promise<ServiceResult<LoadedPuzzle>> {
  const res = await apiFetch<UserPuzzleDto>(`/sudoku/${puzzleId}`);
  if (!res.success || !res.body) {
    return { success: false, message: res.message };
  }
  const dto = res.body;
  return {
    success: true,
    body: {
      puzzleId: dto.puzzleId,
      cells: buildCells(
        dto.originalCells,
        dto.currentCells,
        dto.currentCandidates,
      ),
      originalCells: buildCells(dto.originalCells),
      difficulty: dto.difficulty,
      actions: (dto.actions ?? []).map(deserializeAction),
      time: dto.time,
      isCompleted: dto.isCompleted,
    },
  };
}

export interface SavePuzzleInput {
  puzzleId: string;
  cells: Cell[];
  actions: Action[];
  time: number;
  isCompleted: boolean;
}

export async function updatePuzzle(
  input: SavePuzzleInput,
): Promise<ServiceResult<void>> {
  const dto: UpdateUserPuzzleDto = {
    puzzleId: input.puzzleId,
    cells: cellsToString(input.cells),
    candidates: candidatesToString(input.cells),
    time: input.time,
    isCompleted: input.isCompleted,
    actions: input.actions.map(serializeAction),
  };
  return apiFetch<void>(`/sudoku/${input.puzzleId}`, {
    method: 'PUT',
    body: dto,
  });
}
