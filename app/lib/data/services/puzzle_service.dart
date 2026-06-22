import 'package:app/data/model/puzzle/difficulty.dart';
import 'package:app/data/model/puzzle/puzzle.dart';
import 'package:app/utils/result.dart';

abstract class PuzzleService {
  Future<Result<Puzzle>> getNewPuzzle(DifficultyRating difficulty);
  Future<Result<Puzzle>> getSavedProgress(String puzzleId);
  Future<Result<void>> saveProgress(Puzzle state);
}