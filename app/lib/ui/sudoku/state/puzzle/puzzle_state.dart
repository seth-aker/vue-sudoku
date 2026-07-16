import 'package:app/domain/models/action.dart';
import 'package:app/domain/models/cell.dart';
import 'package:app/domain/models/difficulty.dart';
import 'package:equatable/equatable.dart';

class PuzzleState extends Equatable {
  final String puzzleId;

  final DifficultyRating rating;

  final int score;

  final List<Cell> cells;

  final List<Cell> originalCells;

  final List<Action> actions;

  final int elapsedSeconds;

  final bool isCompleted;

  const PuzzleState({
    required this.puzzleId,
    required this.rating,
    required this.score,
    required this.cells,
    required this.originalCells,
    required this.actions,
    required this.elapsedSeconds,
    this.isCompleted = false,
  });

  @override
  List<Object?> get props => [
    puzzleId,
    rating,
    originalCells,
    cells,
    score,
    actions,
    elapsedSeconds,
    isCompleted,
  ];
}
