import 'dart:convert' show jsonDecode, jsonEncode, utf8;
import 'dart:io';

import 'package:app/domain/models/action.dart';
import 'package:app/domain/models/difficulty.dart';
import 'package:app/domain/models/puzzle.dart';
import 'package:app/data/model/puzzle/puzzle_dto.dart';
import 'package:app/data/services/puzzle_service.dart';
import 'package:app/utils/result.dart';
import 'package:app/utils/serilization.dart';

class PuzzleServiceRemote implements PuzzleService {
  PuzzleServiceRemote({
    String? host,
    int? port,
    this._authProvider,
    HttpClient Function()? clientFactory,
  }) : _host = host ?? 'localhost',
       _port = port ?? 8080,
       _clientFactory = clientFactory ?? HttpClient.new;

  final String _host;
  final int _port;
  final HttpClient Function() _clientFactory;
  final Function()? _authProvider;

  Future<void> _setAuthHeader(HttpHeaders headers) async {
    final header = _authProvider?.call();
    if (header != null) {
      headers.add(HttpHeaders.authorizationHeader, header);
    }
  }

  @override
  Future<Result<Puzzle>> getNewPuzzle(DifficultyRating difficulty) async {
    final client = _clientFactory();
    try {
      final request = await client.get(
        _host,
        _port,
        '/sudoku/new?difficulty=$difficulty',
      );
      _setAuthHeader(request.headers);
      final response = await request.close();
      if (response.statusCode == 200) {
        final stringData = await response.transform(utf8.decoder).join();
        final json = jsonDecode(stringData) as dynamic;
        final dto = NewPuzzleDTO.fromJson(json);
        return Result.ok(_mapDtoToPuzzle(dto));
      } else {
        return Result.error(HttpException("Invalid response"));
      }
    } on Exception catch (err) {
      return Result.error(err);
    }
  }

  @override
  Future<Result<Puzzle>> getSavedProgress(String puzzleId) async {
    final client = _clientFactory();
    try {
      final request = await client.get(_host, _port, '/sudoku/$puzzleId');
      await _setAuthHeader(request.headers);
      final response = await request.close();
      if (response.statusCode == 200) {
        final stringData = await response.transform(utf8.decoder).join();
        final json = jsonDecode(stringData) as dynamic;
        final dto = UserPuzzleDTO.fromJson(json);
        return Result.ok(_mapDtoToPuzzle(dto));
      } else {
        return Result.error(HttpException("Invalid Response"));
      }
    } on Exception catch (err) {
      return Result.error(err);
    }
  }

  @override
  Future<Result<void>> saveProgress(Puzzle state) async {
    final client = _clientFactory();
    try {
      final serializedCells = PuzzleSerializer.serializeCells(state.cells);
      final actions = state.actions
          .map(PuzzleSerializer.serializeAction)
          .toList();
      final request = await client.put(
        _host,
        _port,
        "/sudoku/${state.puzzleId}",
      );
      request.headers.contentType = ContentType.json;
      final payload = {
        'puzzleId': state.puzzleId,
        'cells': serializedCells.cells,
        'candidates': serializedCells.candidates,
        'actions': actions,
        'time': state.elapsedSeconds,
        'isCompleted': state.isCompleted,
      };
      request.write(jsonEncode(payload));
      final result = await request.close();
      if (result.statusCode == 204) {
        return Result.ok(null);
      } else {
        return Result.error(
          HttpException(
            "${result.statusCode} Error: ${result.transform(utf8.decoder).join()}",
          ),
        );
      }
    } on Exception catch (error) {
      return Result.error(error);
    }
  }

  Puzzle _mapDtoToPuzzle(PuzzleDto dto) {
    switch (dto) {
      case UserPuzzleDTO():
        final cells = PuzzleSerializer.deserializeCells(
          dto.cells,
          dto.candidates,
        );
        final originalCells = PuzzleSerializer.deserializeCells(
          dto.originalCells,
          null,
        );
        final actions = dto.actions
            ?.map(PuzzleSerializer.deserializeAction)
            .toList();
        return Puzzle(
          puzzleId: dto.puzzleId,
          cells: cells,
          orginalCells: originalCells,
          rating: dto.rating,
          score: dto.score,
          elapsedSeconds: dto.time,
          isCompleted: dto.isCompleted,
          actions: actions ?? [],
        );
      case NewPuzzleDTO():
        final cells = PuzzleSerializer.deserializeCells(dto.cells, null);
        return Puzzle(
          puzzleId: dto.puzzleId,
          cells: cells,
          orginalCells: cells,
          rating: dto.rating,
          score: dto.score,
          elapsedSeconds: 0,
          actions: [] as List<Action>,
        );
      default:
        throw UnsupportedError(
          "An unknown type of PuzzleDto was used in the function _mapDtoToPuzzle",
        );
    }
  }
}
