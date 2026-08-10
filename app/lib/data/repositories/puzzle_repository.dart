import 'package:app/data/service/api/api_client_service.dart';
import 'package:app/domain/models/difficulty.dart';
import 'package:app/domain/models/puzzle.dart';
import 'package:app/utils/result.dart';

class PuzzleRepository {
  const PuzzleRepository({required this._clientService});

  final ApiClientService _clientService;

  Future<Result<Puzzle>> getNewPuzzle(DifficultyRating difficulty) async {
    try {
      return await _clientService.getNewPuzzle(difficulty);
    } on Exception catch (err) {
      return Result.error(err);
    }
  }

  Future<Result<Puzzle>> getPuzzle(String puzzleId) async {
    try {
      return await _clientService.getPuzzle(puzzleId);
    } on Exception catch (err) {
      return Result.error(err);
    }
  }

  Future<Result<void>> saveProgress(Puzzle state) async {
    try {
      return await _clientService.saveProgress(state);
    } on Exception catch (err) {
      return Result.error(err);
    }
  }
}
