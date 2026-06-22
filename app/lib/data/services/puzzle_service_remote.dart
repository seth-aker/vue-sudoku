import 'package:app/data/model/puzzle/difficulty.dart';
import 'package:app/data/model/puzzle/puzzle.dart';
import 'package:app/data/services/puzzle_service.dart';
import 'package:app/utils/result.dart';

class PuzzleServiceRemote implements PuzzleService {
  PuzzleServiceRemote();
  @override
  Future<Result<Puzzle>> getNewPuzzle(DifficultyRating difficulty) {
    // TODO: implement getNewPuzzle
    throw UnimplementedError();
  }
  
  @override
  Future<Result<Puzzle>> getSavedProgress(String puzzleId) {
    // TODO: implement getSavedProgress
    throw UnimplementedError();
  }
  
  @override
  Future<Result<void>> saveProgress(Puzzle state) {
    // TODO: implement saveProgress
    throw UnimplementedError();
  }
}