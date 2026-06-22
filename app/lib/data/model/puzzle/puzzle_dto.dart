import 'package:app/data/model/puzzle/difficulty.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
part 'puzzle_dto.freezed.dart';
part 'puzzle_dto.g.dart';

@freezed
abstract class NewPuzzleDTO with _$NewPuzzleDTO {
  const factory NewPuzzleDTO({
    required String puzzleId,
    required String cells,
    required DifficultyRating rating,
    required int score
  }) = _PuzzleDTO;
  
  factory NewPuzzleDTO.fromJson(Map<String, dynamic> json) => 
    _$NewPuzzleDTOFromJson(json);
}

@freezed 
abstract class UserPuzzleDTO with _$UserPuzzleDTO {
  const factory UserPuzzleDTO({
    required String puzzleId,
    required String currentCells,
    required String originalCells,
    required String candidates,
    required DifficultyRating rating,
    required int score,
    required int time,
    required bool isCompleted,
    List<int>? actions
  }) = _UserPuzzleDTO;
  
  factory UserPuzzleDTO.fromJson(Map<String, dynamic> json) => 
    _$UserPuzzleDTOFromJson(json);
}