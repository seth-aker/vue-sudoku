part of 'puzzle_bloc.dart';

sealed class PuzzleState extends Equatable {
  const PuzzleState();
}

class PuzzleInitialState extends PuzzleState {
  const PuzzleInitialState();
  @override
  List<Object?> get props => [];
}

class PuzzleSuccessState extends PuzzleState {
  final String puzzleId;

  final DifficultyRating rating;

  final int score;

  final List<Cell> cells;

  final List<Cell> originalCells;

  final List<Action> history;

  final List<Action> redoActions;

  final int elapsedSeconds;

  final bool isCompleted;

  final int? selectedIdx;

  final bool usingPencil;

  final bool autoCandidateModeOn;

  const PuzzleSuccessState({
    required this.puzzleId,
    required this.rating,
    required this.score,
    required this.cells,
    required this.originalCells,
    required this.history,
    required this.elapsedSeconds,
    this.redoActions = const [],
    this.isCompleted = false,
    this.usingPencil = false,
    this.autoCandidateModeOn = false,
    this.selectedIdx,
  });
  PuzzleSuccessState copyWith({
    List<Cell>? cells,
    List<Action>? history,
    List<Action>? redoActions,
    int? elapsedSeconds,
    int? selectedIdx,
    bool? usingPencil,
    bool? autoCandidateModeOn,
  }) {
    return PuzzleSuccessState(
      puzzleId: puzzleId,
      rating: rating,
      score: score,
      cells: cells ?? this.cells,
      originalCells: originalCells,
      history: history ?? this.history,
      redoActions: redoActions ?? this.redoActions,
      elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
      usingPencil: usingPencil ?? this.usingPencil,
      selectedIdx: selectedIdx ?? this.selectedIdx,
      autoCandidateModeOn: autoCandidateModeOn ?? this.autoCandidateModeOn,
    );
  }

  @override
  List<Object?> get props => [
    puzzleId,
    rating,
    originalCells,
    cells,
    score,
    history,
    elapsedSeconds,
    isCompleted,
    selectedIdx,
    usingPencil,
    autoCandidateModeOn,
  ];
}

class PuzzleLoadingState extends PuzzleState {
  const PuzzleLoadingState();
  @override
  List<Object?> get props => [];
}

class PuzzleErrorState extends PuzzleState {
  const PuzzleErrorState();
  @override
  List<Object?> get props => [];
}
