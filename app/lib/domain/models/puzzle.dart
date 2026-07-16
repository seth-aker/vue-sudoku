import 'package:app/domain/models/action.dart';
import 'package:app/domain/models/cell.dart';
import 'package:app/domain/models/difficulty.dart';
import 'package:app/data/model/puzzle/puzzle_dto.dart';
import 'package:app/utils/serilization.dart';

class Puzzle {
  final String puzzleId;

  final DifficultyRating rating;

  final int score;

  List<Cell> cells;

  final List<Cell> orginalCells;

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
    this.isCompleted = false,
  });
}

class NewPuzzleDtoToPuzzleMapper {
  static Puzzle map(NewPuzzleDTO dto) {
    final cells = parseCells(dto.cells);
    return Puzzle(
      puzzleId: dto.puzzleId,
      rating: dto.rating,
      score: dto.score,
      cells: cells,
      orginalCells: cells,
      actions: [],
      elapsedSeconds: 0,
    );
  }

  static List<Cell> parseCells(String cellStr) {
    return PuzzleSerializer.deserializeCells(cellStr, null);
  }
}
