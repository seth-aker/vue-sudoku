import 'package:app/data/model/puzzle/action.dart';
import 'package:app/data/model/puzzle/cell.dart';
import 'package:app/data/model/puzzle/difficulty.dart';

class Puzzle {
  final String puzzleId;

  final DifficultyRating rating;

  final int score;

  List<Cell> cells;

  List<Cell> orginalCells;

  List<Action> actions;

  int elapsedSeconds;

  bool isCompleted = false;

  Puzzle({
    required this.puzzleId,
    required this.rating,
    required this.score,
    required this.cells,
    required this.orginalCells,
    required this.actions,
    required this.elapsedSeconds,
    this.isCompleted = false
  });
}
