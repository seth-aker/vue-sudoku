import 'package:app/domain/models/difficulty.dart';
import 'package:app/domain/models/puzzle.dart';
import 'package:app/utils/result.dart';

abstract class PuzzleService {
  Future<Result<Puzzle>> getNewPuzzle(DifficultyRating difficulty);
  Future<Result<Puzzle>> getSavedProgress(String puzzleId);
  Future<Result<void>> saveProgress(Puzzle state);
}
